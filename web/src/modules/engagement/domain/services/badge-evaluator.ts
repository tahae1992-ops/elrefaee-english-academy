/**
 * Evaluates which badges (DB Design §3.7's `engagement.badges`, seeded
 * via migration 0025) a learner newly qualifies for, given a snapshot of
 * their current stats. Pure and zero-I/O — the caller (application
 * layer) supplies the snapshot and the set of already-earned keys, and
 * persists whatever this returns; this function never touches the
 * database itself.
 *
 * Badge keys here are the single source of truth for what the seeded
 * `badges` rows must match — a key with no corresponding definition
 * here is inert (never awarded); a key with no seeded row would fail
 * the FK on award, caught immediately in integration testing.
 */

export interface LearnerStatsSnapshot {
  totalXp: number;
  currentStreakDays: number;
  lessonsCompleted: number;
  exercisesCorrect: number;
  reviewsCompleted: number;
}

interface BadgeDefinition {
  key: string;
  isEarned: (snapshot: LearnerStatsSnapshot) => boolean;
}

const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
  { key: "first_lesson", isEarned: (s) => s.lessonsCompleted >= 1 },
  { key: "first_exercise", isEarned: (s) => s.exercisesCorrect >= 1 },
  { key: "streak_3", isEarned: (s) => s.currentStreakDays >= 3 },
  { key: "streak_7", isEarned: (s) => s.currentStreakDays >= 7 },
  { key: "streak_30", isEarned: (s) => s.currentStreakDays >= 30 },
  { key: "xp_100", isEarned: (s) => s.totalXp >= 100 },
  { key: "xp_500", isEarned: (s) => s.totalXp >= 500 },
  { key: "reviews_10", isEarned: (s) => s.reviewsCompleted >= 10 },
];

export const BADGE_KEYS: readonly string[] = BADGE_DEFINITIONS.map((definition) => definition.key);

/** Badge keys the learner newly qualifies for — excludes anything already in `alreadyEarnedKeys`. */
export function evaluateNewBadges(snapshot: LearnerStatsSnapshot, alreadyEarnedKeys: ReadonlySet<string>): string[] {
  return BADGE_DEFINITIONS.filter((definition) => !alreadyEarnedKeys.has(definition.key) && definition.isEarned(snapshot)).map(
    (definition) => definition.key,
  );
}
