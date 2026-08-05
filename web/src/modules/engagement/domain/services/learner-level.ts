/**
 * Blueprint §8's motivational-layer "levels" — cosmetic, engagement-only,
 * explicitly never a proficiency claim (that's the CEFR level, owned by
 * `identity.user_profiles.current_level`, a completely separate concept
 * this must never be confused with in UI or code). A pure function over
 * the maintained `xp_balances.total_xp` projection — no separate stored
 * "level" column, avoiding a second value that could drift out of sync
 * with XP.
 *
 * XP-per-level is flat and configuration-driven (SRS FR-18: "XP values
 * are configuration data, not hardcoded per call site") — simple by
 * design for MVP; tuning the curve later is a constant change here, not
 * a schema or call-site change.
 */

export const XP_PER_LEVEL = 100;

export interface LearnerLevel {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function deriveLevel(totalXp: number): LearnerLevel {
  const safeXp = Math.max(0, totalXp);
  return {
    level: Math.floor(safeXp / XP_PER_LEVEL) + 1,
    xpIntoLevel: safeXp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
}
