import { describe, expect, it, vi } from "vitest";
import { GetDailyGoalProgressUseCase } from "./get-daily-goal-progress.use-case";
import type { DailyGoalRepositoryPort } from "@/modules/engagement/application/ports/daily-goal-repository-port";
import type { XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";

describe("GetDailyGoalProgressUseCase", () => {
  it("combines the learner's goal with today's earned XP, querying from the start of the UTC day", async () => {
    const dailyGoals: DailyGoalRepositoryPort = { getOrCreateForUser: vi.fn().mockResolvedValue({ userId: "user-1", goalXp: 20 }) };
    const xp: XpRepositoryPort = {
      award: vi.fn(),
      getBalance: vi.fn(),
      listRecentTransactions: vi.fn(),
      getXpEarnedSince: vi.fn().mockResolvedValue(15),
    };

    const result = await new GetDailyGoalProgressUseCase(dailyGoals, xp).execute("user-1", new Date("2026-08-05T18:30:00.000Z"));

    expect(result).toEqual({ goalXp: 20, earnedTodayXp: 15 });
    expect(xp.getXpEarnedSince).toHaveBeenCalledWith("user-1", new Date("2026-08-05T00:00:00.000Z"));
  });
});
