import { describe, expect, it, vi } from "vitest";
import { AwardXpUseCase } from "./award-xp.use-case";
import type { XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";

describe("AwardXpUseCase", () => {
  it("delegates to the repository and returns its result", async () => {
    const xp: XpRepositoryPort = {
      award: vi.fn().mockResolvedValue({ applied: true, totalXp: 20 }),
      getBalance: vi.fn(),
      listRecentTransactions: vi.fn(),
      getXpEarnedSince: vi.fn(),
    };
    const input = { userId: "user-1", amount: 10, sourceEventId: "event-1", reason: "successfulReview" };

    const result = await new AwardXpUseCase(xp).execute(input);

    expect(xp.award).toHaveBeenCalledWith(input);
    expect(result).toEqual({ applied: true, totalXp: 20 });
  });
});
