/**
 * The learner-facing review-state label (this slice's requirement:
 * "Support review states (new, learning, review, mastered)"). Not a
 * persisted column — DB Design §3.5's `vocabulary_review_state` table
 * has no `state` column, so this is derived purely from `reviewCount`/
 * `stability`, the same two fields the FSRS scheduler already
 * maintains, rather than a second, independently-mutable source of
 * truth that could drift out of sync with the scheduler's own state.
 */
export type ReviewLearningState = "new" | "learning" | "review" | "mastered";

/** Stability (days) at/above which an item is considered out of the fragile "learning" phase. */
const REVIEW_STABILITY_THRESHOLD_DAYS = 7;
/** Stability (days) at/above which an item is considered durably retained. */
const MASTERED_STABILITY_THRESHOLD_DAYS = 30;

export function deriveReviewState(reviewCount: number, stability: number): ReviewLearningState {
  if (reviewCount === 0) return "new";
  if (stability >= MASTERED_STABILITY_THRESHOLD_DAYS) return "mastered";
  if (stability >= REVIEW_STABILITY_THRESHOLD_DAYS) return "review";
  return "learning";
}
