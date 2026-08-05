import { describe, expect, it, vi } from "vitest";
import { UpdateStreakUseCase } from "./update-streak.use-case";
import type { StreakRecord, StreakRepositoryPort } from "@/modules/engagement/application/ports/streak-repository-port";

describe("UpdateStreakUseCase", () => {
  it("creates a fresh streak of 1 for a learner with no prior record", async () => {
    const save = vi.fn().mockImplementation(async (userId: string, state) => ({ userId, ...state }) as StreakRecord);
    const streaks: StreakRepositoryPort = { findByUser: vi.fn().mockResolvedValue(null), save };

    const result = await new UpdateStreakUseCase(streaks).execute("user-1", new Date("2026-08-05T10:00:00Z"));

    expect(result.currentStreakDays).toBe(1);
    expect(save).toHaveBeenCalledWith("user-1", { currentStreakDays: 1, longestStreakDays: 1, lastActiveDate: "2026-08-05", freezeCredits: 0 });
  });

  it("increments an existing streak on a consecutive day", async () => {
    const prior: StreakRecord = { userId: "user-1", currentStreakDays: 3, longestStreakDays: 3, lastActiveDate: "2026-08-04", freezeCredits: 0 };
    const save = vi.fn().mockImplementation(async (userId: string, state) => ({ userId, ...state }) as StreakRecord);
    const streaks: StreakRepositoryPort = { findByUser: vi.fn().mockResolvedValue(prior), save };

    const result = await new UpdateStreakUseCase(streaks).execute("user-1", new Date("2026-08-05T10:00:00Z"));

    expect(result.currentStreakDays).toBe(4);
  });
});
