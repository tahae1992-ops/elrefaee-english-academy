import {
  createGetXpBalanceUseCase,
  createGetStreakUseCase,
  createGetDailyGoalProgressUseCase,
  createListBadgesUseCase,
  createDrizzleProgressAdapter,
  createDrizzleExerciseAttemptAdapter,
  createDrizzleVocabularyReviewStateAdapter,
} from "@/composition-root";
import { deriveLevel } from "@/modules/engagement/interface/types";
import type { BadgeWithStatus } from "@/modules/engagement/interface/types";

export interface GamificationSnapshot {
  xp: { total: number; level: number; xpIntoLevel: number; xpForNextLevel: number };
  dailyGoal: { goalXp: number; earnedTodayXp: number };
  streak: { current: number; longest: number; freezeCredits: number };
  stats: { lessonsCompleted: number; exercisesCorrect: number; reviewsCompleted: number; vocabularyMastered: number };
  badges: BadgeWithStatus[];
}

/**
 * API Spec §6.10's `GET /progress/dashboard` — "Precomputed dashboard
 * aggregate." Deliberately live-computed here, not read from a
 * nightly-batch precomputed store as the doc's full CQRS design (SAD
 * §19) anticipates at scale — no `learning_events` analytics pipeline
 * exists in this codebase yet (a separate, much larger epic). A small
 * number of indexed count queries against real tables is the honest
 * MVP equivalent, same disclosed-simplification pattern as Course
 * Catalog's trimmed Curriculum Engine. Combines `engagement` (XP,
 * level, streak, daily goal, badges) with `learning` (lesson/exercise/
 * review counts) — cross-module, so this lives here, not inside either
 * module's own use-case.
 */
export async function resolveGamificationSnapshot(userId: string, now: Date): Promise<GamificationSnapshot> {
  const [totalXp, streak, dailyGoal, badges, lessonsCompleted, exercisesCorrect, reviewsCompleted, vocabularyMastered] = await Promise.all([
    createGetXpBalanceUseCase().execute(userId),
    createGetStreakUseCase().execute(userId),
    createGetDailyGoalProgressUseCase().execute(userId, now),
    createListBadgesUseCase().execute(userId),
    createDrizzleProgressAdapter().countCompletedForUser(userId),
    createDrizzleExerciseAttemptAdapter().countDistinctCorrectForUser(userId),
    createDrizzleVocabularyReviewStateAdapter().countReviewedForUser(userId),
    createDrizzleVocabularyReviewStateAdapter().countMasteredForUser(userId),
  ]);

  const level = deriveLevel(totalXp);

  return {
    xp: { total: totalXp, level: level.level, xpIntoLevel: level.xpIntoLevel, xpForNextLevel: level.xpForNextLevel },
    dailyGoal: { goalXp: dailyGoal.goalXp, earnedTodayXp: dailyGoal.earnedTodayXp },
    streak: { current: streak?.currentStreakDays ?? 0, longest: streak?.longestStreakDays ?? 0, freezeCredits: streak?.freezeCredits ?? 0 },
    stats: { lessonsCompleted, exercisesCorrect, reviewsCompleted, vocabularyMastered },
    badges,
  };
}
