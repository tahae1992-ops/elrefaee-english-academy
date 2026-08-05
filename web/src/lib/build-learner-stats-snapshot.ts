import {
  createDrizzleProgressAdapter,
  createDrizzleExerciseAttemptAdapter,
  createDrizzleVocabularyReviewStateAdapter,
  createGetXpBalanceUseCase,
  createGetStreakUseCase,
} from "@/composition-root";
import type { LearnerStatsSnapshot } from "@/modules/engagement/interface/types";

/**
 * The one DB-backed composition point combining `learning` module data
 * (lessons completed, exercises correct, reviews completed) with
 * `engagement` module data (XP, streak) into the snapshot badge
 * evaluation needs — same cross-module-orchestration-lives-in-a-
 * shared-lib-file rule as resolve-course-progress.ts/
 * resolve-due-review-queue.ts. Kept separate from the fuller Dashboard
 * snapshot (resolve-gamification-snapshot.ts) since every XP/exercise/
 * review integration point needs exactly this and nothing more —
 * fetching the full badge list on every write would be wasted work.
 */
export async function buildLearnerStatsSnapshot(userId: string): Promise<LearnerStatsSnapshot> {
  const [totalXp, streak, lessonsCompleted, exercisesCorrect, reviewsCompleted] = await Promise.all([
    createGetXpBalanceUseCase().execute(userId),
    createGetStreakUseCase().execute(userId),
    createDrizzleProgressAdapter().countCompletedForUser(userId),
    createDrizzleExerciseAttemptAdapter().countDistinctCorrectForUser(userId),
    createDrizzleVocabularyReviewStateAdapter().countReviewedForUser(userId),
  ]);

  return {
    totalXp,
    currentStreakDays: streak?.currentStreakDays ?? 0,
    lessonsCompleted,
    exercisesCorrect,
    reviewsCompleted,
  };
}
