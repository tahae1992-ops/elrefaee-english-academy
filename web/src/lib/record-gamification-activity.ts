import { createUpdateStreakUseCase, createEvaluateAndAwardBadgesUseCase } from "@/composition-root";
import { buildLearnerStatsSnapshot } from "@/lib/build-learner-stats-snapshot";
import type { BadgeWithStatus } from "@/modules/engagement/interface/types";

export interface GamificationActivityResult {
  newlyAwardedBadges: BadgeWithStatus[];
}

/**
 * The one call every qualifying learner activity makes (lesson
 * completion, an exercise attempt regardless of correctness, a review
 * response regardless of rating) — FR-18: "streak counted on any-day-
 * active basis." Updates the streak, then re-evaluates badge
 * eligibility against the learner's latest stats. XP is awarded
 * separately (not every activity earns XP — an incorrect exercise
 * answer is still "active," but AwardXpUseCase is only called for a
 * successful/correct outcome) via the same single domain service
 * (AwardXpUseCase) from each route, not duplicated here.
 */
export async function recordGamificationActivity(userId: string, now: Date): Promise<GamificationActivityResult> {
  await createUpdateStreakUseCase().execute(userId, now);
  const snapshot = await buildLearnerStatsSnapshot(userId);
  const newlyAwardedBadges = await createEvaluateAndAwardBadgesUseCase().execute(userId, snapshot, now);
  return { newlyAwardedBadges };
}
