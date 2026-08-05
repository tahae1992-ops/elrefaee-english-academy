/**
 * SRS FR-18's validation rule: "XP values are configuration data, not
 * hardcoded per call site (allows tuning without a deploy)." This
 * slice only awards XP for one source (a successful — i.e. not
 * "again" — review response); the table exists as a single named
 * place to add further sources later rather than scattering literals.
 */
export const XP_REWARDS = {
  successfulReview: 10,
} as const;

export type XpReason = keyof typeof XP_REWARDS;
