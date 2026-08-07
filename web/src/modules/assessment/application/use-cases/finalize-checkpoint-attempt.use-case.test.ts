import { describe, expect, it, vi } from "vitest";
import { FinalizeCheckpointAttemptUseCase } from "./finalize-checkpoint-attempt.use-case";
import { CheckpointBlueprintNotFoundError } from "./start-checkpoint-attempt.use-case";
import { AttemptAlreadyCompletedError, AttemptNotOwnedError } from "./submit-response.use-case";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { CheckpointResultRepositoryPort } from "@/modules/assessment/application/ports/checkpoint-result-repository-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", blueprintId: "checkpoint-blueprint-1", status: "in_progress", assembledItems: [], ...overrides };
}

function fakeItemBank(overrides: Partial<ItemBankPort> = {}): ItemBankPort {
  return {
    getBlueprint: vi.fn(),
    assembleItems: vi.fn(),
    getSpeakingPrompt: vi.fn(),
    getItemForScoring: vi.fn(),
    getCheckpointBlueprint: vi.fn(),
    assembleCheckpointItems: vi.fn(),
    getItemsByIds: vi.fn(),
    getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "unit_checkpoint", unitId: "unit-1", cefrLevel: null, academyId: "academy-1", passThresholdPercent: 0.7 }),
    getCertificationBlueprint: vi.fn(),
    assembleCertificationItems: vi.fn(),
    ...overrides,
  };
}

function fakeAttempts(overrides: Partial<AttemptRepositoryPort> = {}): AttemptRepositoryPort {
  return {
    create: vi.fn(),
    findById: vi.fn().mockResolvedValue(fakeAttempt()),
    findInProgressByUserAndBlueprint: vi.fn(),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn().mockResolvedValue([
      { itemId: "g1", isCorrect: true },
      { itemId: "g2", isCorrect: true },
      { itemId: "g3", isCorrect: false },
    ]),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

function fakeCheckpointResults(overrides: Partial<CheckpointResultRepositoryPort> = {}): CheckpointResultRepositoryPort {
  return {
    save: vi.fn().mockResolvedValue({ id: "result-1", attemptId: "attempt-1", userId: "user-1", unitId: "unit-1", scorePercent: 67, passed: false, skillBreakdown: {}, createdAt: new Date() }),
    findByAttemptId: vi.fn(),
    findPassedUnitIds: vi.fn(),
    ...overrides,
  };
}

describe("FinalizeCheckpointAttemptUseCase", () => {
  it("scores the attempt, saves a checkpoint result, and marks the attempt completed", async () => {
    const itemBank = fakeItemBank({ getItemForScoring: vi.fn().mockResolvedValue({ skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", scoringKey: null }) });
    const attempts = fakeAttempts();
    const checkpointResults = fakeCheckpointResults();

    const result = await new FinalizeCheckpointAttemptUseCase(itemBank, attempts, checkpointResults).execute({ attemptId: "attempt-1", userId: "user-1" });

    expect(result.unitId).toBe("unit-1");
    expect(result.scorePercent).toBe(67);
    expect(result.passed).toBe(false);
    expect(checkpointResults.save).toHaveBeenCalledWith(
      expect.objectContaining({ attemptId: "attempt-1", userId: "user-1", unitId: "unit-1" }),
    );
    expect(attempts.markCompleted).toHaveBeenCalledWith("attempt-1");
  });

  it("throws AttemptNotOwnedError rather than scoring another user's attempt", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(fakeAttempt({ userId: "someone-else" })) });
    const checkpointResults = fakeCheckpointResults();

    await expect(
      new FinalizeCheckpointAttemptUseCase(itemBank, attempts, checkpointResults).execute({ attemptId: "attempt-1", userId: "user-1" }),
    ).rejects.toThrow(AttemptNotOwnedError);
    expect(checkpointResults.save).not.toHaveBeenCalled();
  });

  it("throws AttemptAlreadyCompletedError when the attempt is no longer in progress", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(fakeAttempt({ status: "completed" })) });
    const checkpointResults = fakeCheckpointResults();

    await expect(
      new FinalizeCheckpointAttemptUseCase(itemBank, attempts, checkpointResults).execute({ attemptId: "attempt-1", userId: "user-1" }),
    ).rejects.toThrow(AttemptAlreadyCompletedError);
  });

  it("throws CheckpointBlueprintNotFoundError if the attempt's blueprint isn't a checkpoint kind", async () => {
    const itemBank = fakeItemBank({ getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "placement", unitId: null, cefrLevel: null, academyId: "academy-1", passThresholdPercent: 0.7 }) });
    const attempts = fakeAttempts();
    const checkpointResults = fakeCheckpointResults();

    await expect(
      new FinalizeCheckpointAttemptUseCase(itemBank, attempts, checkpointResults).execute({ attemptId: "attempt-1", userId: "user-1" }),
    ).rejects.toThrow(CheckpointBlueprintNotFoundError);
  });
});
