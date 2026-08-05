import { describe, expect, it } from "vitest";
import { updateStreak, type StreakState } from "@/modules/engagement/domain/services/streak";

describe("updateStreak", () => {
  it("starts a streak of 1 for a learner with no prior state", () => {
    const result = updateStreak(null, new Date("2026-08-05T10:00:00Z"));
    expect(result).toEqual({ currentStreakDays: 1, longestStreakDays: 1, lastActiveDate: "2026-08-05", freezeCredits: 0 });
  });

  it("makes no change when already active today", () => {
    const prior: StreakState = { currentStreakDays: 4, longestStreakDays: 4, lastActiveDate: "2026-08-05", freezeCredits: 0 };
    const result = updateStreak(prior, new Date("2026-08-05T22:00:00Z"));
    expect(result).toEqual(prior);
  });

  it("increments the streak on a consecutive day", () => {
    const prior: StreakState = { currentStreakDays: 4, longestStreakDays: 4, lastActiveDate: "2026-08-05", freezeCredits: 0 };
    const result = updateStreak(prior, new Date("2026-08-06T09:00:00Z"));
    expect(result).toEqual({ currentStreakDays: 5, longestStreakDays: 5, lastActiveDate: "2026-08-06", freezeCredits: 0 });
  });

  it("grants a freeze credit when a 7-day milestone is reached", () => {
    const prior: StreakState = { currentStreakDays: 6, longestStreakDays: 6, lastActiveDate: "2026-08-05", freezeCredits: 0 };
    const result = updateStreak(prior, new Date("2026-08-06T09:00:00Z"));
    expect(result.currentStreakDays).toBe(7);
    expect(result.freezeCredits).toBe(1);
  });

  it("does not grant a freeze credit on a non-multiple-of-7 day", () => {
    const prior: StreakState = { currentStreakDays: 7, longestStreakDays: 7, lastActiveDate: "2026-08-05", freezeCredits: 1 };
    const result = updateStreak(prior, new Date("2026-08-06T09:00:00Z"));
    expect(result.currentStreakDays).toBe(8);
    expect(result.freezeCredits).toBe(1);
  });

  it("preserves longestStreakDays when it's already higher than the current run", () => {
    const prior: StreakState = { currentStreakDays: 2, longestStreakDays: 10, lastActiveDate: "2026-08-05", freezeCredits: 0 };
    const result = updateStreak(prior, new Date("2026-08-06T09:00:00Z"));
    expect(result.longestStreakDays).toBe(10);
  });

  it("consumes a freeze credit to preserve the streak across exactly one missed day", () => {
    const prior: StreakState = { currentStreakDays: 5, longestStreakDays: 5, lastActiveDate: "2026-08-05", freezeCredits: 1 };
    const result = updateStreak(prior, new Date("2026-08-07T09:00:00Z"));
    expect(result).toEqual({ currentStreakDays: 6, longestStreakDays: 6, lastActiveDate: "2026-08-07", freezeCredits: 0 });
  });

  it("resets to 1 across a one-day gap with no freeze credits available", () => {
    const prior: StreakState = { currentStreakDays: 5, longestStreakDays: 8, lastActiveDate: "2026-08-05", freezeCredits: 0 };
    const result = updateStreak(prior, new Date("2026-08-07T09:00:00Z"));
    expect(result).toEqual({ currentStreakDays: 1, longestStreakDays: 8, lastActiveDate: "2026-08-07", freezeCredits: 0 });
  });

  it("resets to 1 across a longer gap even with freeze credits available", () => {
    const prior: StreakState = { currentStreakDays: 5, longestStreakDays: 8, lastActiveDate: "2026-08-01", freezeCredits: 3 };
    const result = updateStreak(prior, new Date("2026-08-07T09:00:00Z"));
    expect(result).toEqual({ currentStreakDays: 1, longestStreakDays: 8, lastActiveDate: "2026-08-07", freezeCredits: 3 });
  });
});
