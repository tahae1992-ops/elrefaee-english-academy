/**
 * SRS FR-18's validation rule: "XP values are configuration data, not
 * hardcoded per call site (allows tuning without a deploy)." Blueprint
 * §8/PRD §7.9: "XP awarded per completed lesson/exercise/review" —
 * every source this platform currently has a real completion event
 * for is named here, all awarded through the one AwardXpUseCase
 * (Gamification Engine slice's "single domain service" requirement).
 */
export const XP_REWARDS = {
  lessonCompleted: 50,
  exerciseCorrect: 5,
  successfulReview: 10,
} as const;

export type XpReason = keyof typeof XP_REWARDS;
