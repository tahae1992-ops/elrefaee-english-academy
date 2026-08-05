/**
 * EDD §15's "FSRS-style algorithm (modeling per-item stability/
 * difficulty/retrievability from the learner's own review history)" —
 * a pure, I/O-free domain service (SAD §17: "the FSRS scheduler is a
 * pure domain service... zero I/O, zero framework dependency").
 *
 * This models the same state variables and forgetting-curve shape as
 * FSRS (stability/difficulty in days/1-10, retrievability derived from
 * elapsed time via the published power-law forgetting curve
 * `R(t,S) = (1 + t/(9S))^-1`), but the stability/difficulty *update*
 * weights below are reasonable, hand-set MVP defaults, not the
 * ML-fitted weights the real FSRS algorithm trains per-learner from a
 * large review corpus — none exists yet for this platform. Swapping in
 * fitted weights later is a constant-table change, not an architecture
 * change (mirrors SRS FR-18's "XP values are configuration data, not
 * hardcoded per call site" convention, applied here to scheduling).
 */

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewSchedulerState {
  /** Days until retrievability decays to the request-retention target. */
  stability: number;
  /** 1 (easiest) to 10 (hardest). */
  difficulty: number;
}

export interface SchedulingResult extends ReviewSchedulerState {
  dueAt: Date;
}

const MIN_STABILITY = 0.1;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;
const DEFAULT_DIFFICULTY = 5;

/** The target probability of successful recall at the next scheduled review. */
const REQUEST_RETENTION = 0.9;

/** Shape constant of the `R(t,S) = (1 + t/(FORGETTING_CURVE_FACTOR*S))^-1` forgetting curve. */
const FORGETTING_CURVE_FACTOR = 9;

const INITIAL_STABILITY: Record<ReviewRating, number> = {
  again: 0.4,
  hard: 1.2,
  good: 3,
  easy: 7,
};

const DIFFICULTY_DELTA: Record<ReviewRating, number> = {
  again: 1.4,
  hard: 0.6,
  good: 0,
  easy: -0.8,
};

/** How strongly a successful review grows stability, scaled by rating. */
const STABILITY_GROWTH_BONUS: Record<Exclude<ReviewRating, "again">, number> = {
  hard: 0.6,
  good: 1,
  easy: 1.6,
};

function clampDifficulty(value: number): number {
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, value));
}

/** Probability of successful recall after `elapsedDays` at the given `stability`. Monotonically decreasing in elapsed time. */
export function retrievability(elapsedDays: number, stability: number): number {
  if (elapsedDays <= 0) return 1;
  return (1 + elapsedDays / (FORGETTING_CURVE_FACTOR * stability)) ** -1;
}

/** The interval (days) at which retrievability decays to exactly REQUEST_RETENTION — the exact algebraic inverse of `retrievability`. */
function nextIntervalDays(stability: number): number {
  const days = FORGETTING_CURVE_FACTOR * stability * (1 / REQUEST_RETENTION - 1);
  return Math.max(1, Math.round(days));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** Schedules a vocabulary item's very first review (no prior state — `review_count === 0`). */
export function scheduleInitialReview(rating: ReviewRating, now: Date): SchedulingResult {
  const stability = INITIAL_STABILITY[rating];
  const difficulty = clampDifficulty(DEFAULT_DIFFICULTY + DIFFICULTY_DELTA[rating]);
  return { stability, difficulty, dueAt: addDays(now, nextIntervalDays(stability)) };
}

/** Schedules a subsequent review given the item's prior scheduler state. */
export function scheduleReview(prior: ReviewSchedulerState, rating: ReviewRating, now: Date, lastReviewedAt: Date): SchedulingResult {
  const elapsedDays = Math.max(0, (now.getTime() - lastReviewedAt.getTime()) / 86_400_000);
  const r = retrievability(elapsedDays, prior.stability);

  // Difficulty drifts toward the rating's delta, with mild mean-reversion toward the neutral midpoint so it doesn't drift to an extreme forever.
  const difficulty = clampDifficulty(prior.difficulty + DIFFICULTY_DELTA[rating] - 0.1 * (prior.difficulty - DEFAULT_DIFFICULTY));

  let stability: number;
  if (rating === "again") {
    // A lapse: stability collapses toward a fraction of its prior value, harder items collapsing further.
    stability = Math.max(MIN_STABILITY, prior.stability * 0.5 * difficulty ** -0.2);
  } else {
    const growth =
      1 +
      Math.exp(0.1) * (11 - difficulty) * prior.stability ** -0.15 * (Math.exp((1 - r) * 0.8) - 1) * STABILITY_GROWTH_BONUS[rating];
    stability = prior.stability * Math.max(growth, 1);
  }

  return { stability, difficulty, dueAt: addDays(now, nextIntervalDays(stability)) };
}
