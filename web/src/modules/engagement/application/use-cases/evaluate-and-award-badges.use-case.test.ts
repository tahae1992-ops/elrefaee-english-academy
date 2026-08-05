import { describe, expect, it, vi } from "vitest";
import { EvaluateAndAwardBadgesUseCase } from "./evaluate-and-award-badges.use-case";
import type { BadgeRepositoryPort, BadgeWithStatus } from "@/modules/engagement/application/ports/badge-repository-port";
import type { LearnerStatsSnapshot } from "@/modules/engagement/domain/services/badge-evaluator";

const ZERO_SNAPSHOT: LearnerStatsSnapshot = {
  totalXp: 0,
  currentStreakDays: 0,
  lessonsCompleted: 0,
  exercisesCorrect: 0,
  reviewsCompleted: 0,
};

describe("EvaluateAndAwardBadgesUseCase", () => {
  it("awards newly-qualifying badges and returns them", async () => {
    const awarded: BadgeWithStatus[] = [{ key: "first_lesson", name: "First Steps", description: "d", iconRef: "Footprints", earnedAt: new Date() }];
    const badges: BadgeRepositoryPort = {
      listForUser: vi.fn(),
      listEarnedKeysForUser: vi.fn().mockResolvedValue(new Set()),
      awardBadges: vi.fn().mockResolvedValue(awarded),
    };
    const snapshot = { ...ZERO_SNAPSHOT, lessonsCompleted: 1 };

    const result = await new EvaluateAndAwardBadgesUseCase(badges).execute("user-1", snapshot, new Date());

    expect(badges.awardBadges).toHaveBeenCalledWith("user-1", ["first_lesson"], expect.any(Date));
    expect(result).toEqual(awarded);
  });

  it("does nothing and never calls awardBadges when no new badge qualifies", async () => {
    const badges: BadgeRepositoryPort = {
      listForUser: vi.fn(),
      listEarnedKeysForUser: vi.fn().mockResolvedValue(new Set()),
      awardBadges: vi.fn(),
    };

    const result = await new EvaluateAndAwardBadgesUseCase(badges).execute("user-1", ZERO_SNAPSHOT, new Date());

    expect(badges.awardBadges).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("excludes already-earned badges from evaluation", async () => {
    const badges: BadgeRepositoryPort = {
      listForUser: vi.fn(),
      listEarnedKeysForUser: vi.fn().mockResolvedValue(new Set(["first_lesson"])),
      awardBadges: vi.fn().mockResolvedValue([]),
    };
    const snapshot = { ...ZERO_SNAPSHOT, lessonsCompleted: 1 };

    await new EvaluateAndAwardBadgesUseCase(badges).execute("user-1", snapshot, new Date());

    expect(badges.awardBadges).not.toHaveBeenCalled();
  });
});
