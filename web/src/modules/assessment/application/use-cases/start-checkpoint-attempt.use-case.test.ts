import { describe, expect, it, vi } from "vitest";
import { CheckpointBlueprintNotFoundError, StartCheckpointAttemptUseCase } from "./start-checkpoint-attempt.use-case";
import type { AssessmentItem, CheckpointBlueprint, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";

const blueprint: CheckpointBlueprint = {
  id: "checkpoint-blueprint-1",
  unitId: "unit-1",
  itemCount: 6,
  passThresholdPercent: 0.7,
  skills: ["grammar", "vocabulary"],
};

function item(id: string): AssessmentItem {
  return { id, skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", prompt: {} };
}

function fakeItemBank(overrides: Partial<ItemBankPort> = {}): ItemBankPort {
  return {
    getBlueprint: vi.fn(),
    assembleItems: vi.fn(),
    getSpeakingPrompt: vi.fn(),
    getItemForScoring: vi.fn(),
    getCheckpointBlueprint: vi.fn().mockResolvedValue(blueprint),
    assembleCheckpointItems: vi.fn().mockResolvedValue([item("i1"), item("i2")]),
    getItemsByIds: vi.fn(),
    getBlueprintMeta: vi.fn(),
    getCertificationBlueprint: vi.fn(),
    assembleCertificationItems: vi.fn(),
    ...overrides,
  };
}

function fakeAttempts(overrides: Partial<AttemptRepositoryPort> = {}): AttemptRepositoryPort {
  return {
    create: vi.fn().mockResolvedValue({ id: "attempt-1", userId: "user-1", blueprintId: blueprint.id, status: "in_progress", assembledItems: ["i1", "i2"] } satisfies AttemptRecord),
    findById: vi.fn(),
    findInProgressByUserAndBlueprint: vi.fn().mockResolvedValue(null),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

describe("StartCheckpointAttemptUseCase", () => {
  it("assembles the unit's checkpoint items and creates a new attempt", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts();

    const result = await new StartCheckpointAttemptUseCase(itemBank, attempts).execute({ userId: "user-1", unitId: "unit-1" });

    expect(itemBank.assembleCheckpointItems).toHaveBeenCalledWith("unit-1", 6);
    expect(attempts.create).toHaveBeenCalledWith({ userId: "user-1", blueprintId: blueprint.id, assembledItemIds: ["i1", "i2"] });
    expect(result).toEqual({ attemptId: "attempt-1", items: [item("i1"), item("i2")] });
  });

  it("resumes an existing in-progress attempt instead of creating a duplicate", async () => {
    const existing: AttemptRecord = { id: "existing-attempt", userId: "user-1", blueprintId: blueprint.id, status: "in_progress", assembledItems: ["i1", "i2"] };
    const itemBank = fakeItemBank({ getItemsByIds: vi.fn().mockResolvedValue([item("i1"), item("i2")]) });
    const attempts = fakeAttempts({ findInProgressByUserAndBlueprint: vi.fn().mockResolvedValue(existing) });

    const result = await new StartCheckpointAttemptUseCase(itemBank, attempts).execute({ userId: "user-1", unitId: "unit-1" });

    expect(attempts.create).not.toHaveBeenCalled();
    expect(itemBank.getItemsByIds).toHaveBeenCalledWith(["i1", "i2"]);
    expect(result.attemptId).toBe("existing-attempt");
  });

  it("throws CheckpointBlueprintNotFoundError when the unit has no checkpoint configured", async () => {
    const itemBank = fakeItemBank({ getCheckpointBlueprint: vi.fn().mockResolvedValue(null) });
    const attempts = fakeAttempts();

    await expect(new StartCheckpointAttemptUseCase(itemBank, attempts).execute({ userId: "user-1", unitId: "unit-1" })).rejects.toThrow(
      CheckpointBlueprintNotFoundError,
    );
  });
});
