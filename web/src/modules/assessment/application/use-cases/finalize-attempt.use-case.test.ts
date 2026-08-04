import { describe, expect, it, vi } from "vitest";
import { FinalizeAttemptUseCase } from "./finalize-attempt.use-case";
import { AttemptNotOwnedError } from "./submit-response.use-case";
import type { AttemptRepositoryPort, AttemptRecord } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", status: "in_progress", assembledItems: [], ...overrides };
}

describe("FinalizeAttemptUseCase", () => {
  it("scores only graded (non-null isCorrect) responses, saves the result, and marks the attempt completed", async () => {
    const itemBank: ItemBankPort = {
      getBlueprint: vi.fn(),
      assembleItems: vi.fn(),
      getSpeakingPrompt: vi.fn(),
      // Only g1/g2 are ever looked up — the "speak-1" response is
      // filtered out (isCorrect: null) before any item lookup happens.
      getItemForScoring: vi
        .fn()
        .mockResolvedValue({ skill: "grammar", cefrLevel: "b1", itemType: "multiple_choice", scoringKey: null }),
    };
    const attempts: AttemptRepositoryPort = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(fakeAttempt()),
      hasResponseForItem: vi.fn(),
      recordResponse: vi.fn(),
      getResponses: vi.fn().mockResolvedValue([
        { itemId: "g1", isCorrect: true },
        { itemId: "g2", isCorrect: true },
        { itemId: "speak-1", isCorrect: null }, // ungraded, must be excluded from scoring
      ]),
      markCompleted: vi.fn(),
    };
    const results: ResultRepositoryPort = {
      save: vi.fn().mockResolvedValue({ id: "result-1", attemptId: "attempt-1", userId: "user-1", skillLevels: {}, overallLevel: "b1", createdAt: new Date() }),
      findByAttemptId: vi.fn(),
    };

    const score = await new FinalizeAttemptUseCase(itemBank, attempts, results).execute({ attemptId: "attempt-1", userId: "user-1" });

    expect(score.overallLevel).toBe("b1");
    expect(results.save).toHaveBeenCalledWith(
      expect.objectContaining({ attemptId: "attempt-1", userId: "user-1", overallLevel: "b1" }),
    );
    expect(attempts.markCompleted).toHaveBeenCalledWith("attempt-1");
  });

  it("throws AttemptNotOwnedError rather than scoring another user's attempt", async () => {
    const itemBank: ItemBankPort = {
      getBlueprint: vi.fn(),
      assembleItems: vi.fn(),
      getSpeakingPrompt: vi.fn(),
      getItemForScoring: vi.fn(),
    };
    const attempts: AttemptRepositoryPort = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(fakeAttempt({ userId: "someone-else" })),
      hasResponseForItem: vi.fn(),
      recordResponse: vi.fn(),
      getResponses: vi.fn(),
      markCompleted: vi.fn(),
    };
    const results: ResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn() };

    await expect(
      new FinalizeAttemptUseCase(itemBank, attempts, results).execute({ attemptId: "attempt-1", userId: "user-1" }),
    ).rejects.toThrow(AttemptNotOwnedError);
    expect(results.save).not.toHaveBeenCalled();
  });
});
