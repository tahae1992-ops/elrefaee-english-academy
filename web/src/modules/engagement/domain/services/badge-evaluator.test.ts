import { describe, expect, it } from "vitest";
import { evaluateNewBadges, BADGE_KEYS, type LearnerStatsSnapshot } from "@/modules/engagement/domain/services/badge-evaluator";

const ZERO_SNAPSHOT: LearnerStatsSnapshot = {
  totalXp: 0,
  currentStreakDays: 0,
  lessonsCompleted: 0,
  exercisesCorrect: 0,
  reviewsCompleted: 0,
};

describe("evaluateNewBadges", () => {
  it("returns nothing for a learner with zero activity", () => {
    expect(evaluateNewBadges(ZERO_SNAPSHOT, new Set())).toEqual([]);
  });

  it("returns first_lesson once a lesson is completed", () => {
    const snapshot = { ...ZERO_SNAPSHOT, lessonsCompleted: 1 };
    expect(evaluateNewBadges(snapshot, new Set())).toContain("first_lesson");
  });

  it("returns multiple newly-qualifying badges at once", () => {
    const snapshot: LearnerStatsSnapshot = {
      totalXp: 100,
      currentStreakDays: 3,
      lessonsCompleted: 1,
      exercisesCorrect: 1,
      reviewsCompleted: 0,
    };
    const result = evaluateNewBadges(snapshot, new Set());
    expect(result.sort()).toEqual(["first_exercise", "first_lesson", "streak_3", "xp_100"].sort());
  });

  it("excludes badges already in alreadyEarnedKeys even if the predicate still holds", () => {
    const snapshot = { ...ZERO_SNAPSHOT, lessonsCompleted: 1 };
    expect(evaluateNewBadges(snapshot, new Set(["first_lesson"]))).toEqual([]);
  });

  it("does not award a higher-tier streak badge before its threshold", () => {
    const snapshot = { ...ZERO_SNAPSHOT, currentStreakDays: 5 };
    const result = evaluateNewBadges(snapshot, new Set());
    expect(result).toContain("streak_3");
    expect(result).not.toContain("streak_7");
  });

  it("every defined badge key is reachable by some snapshot", () => {
    const maxedSnapshot: LearnerStatsSnapshot = {
      totalXp: 1000,
      currentStreakDays: 30,
      lessonsCompleted: 5,
      exercisesCorrect: 5,
      reviewsCompleted: 20,
    };
    const result = evaluateNewBadges(maxedSnapshot, new Set());
    expect(result.sort()).toEqual([...BADGE_KEYS].sort());
  });
});
