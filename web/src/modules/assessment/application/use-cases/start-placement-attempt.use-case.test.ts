import { describe, expect, it, vi } from "vitest";
import { BlueprintNotFoundError, StartPlacementAttemptUseCase } from "./start-placement-attempt.use-case";
import type { ItemBankPort, PlacementBlueprint, AssessmentItem } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";

const blueprint: PlacementBlueprint = {
  id: "blueprint-1",
  itemsPerSkillPerTier: 2,
  tiersAroundSelfAssessment: 1,
  passThresholdPercent: 70,
  gradedSkills: ["grammar", "vocabulary"],
};

function item(id: string): AssessmentItem {
  return { id, skill: "grammar", cefrLevel: "b1", itemType: "multiple_choice", prompt: {} };
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
    getBlueprintMeta: vi.fn(),
    ...overrides,
  };
}

function fakeAttempts(overrides: Partial<AttemptRepositoryPort> = {}): AttemptRepositoryPort {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findInProgressByUserAndBlueprint: vi.fn(),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

describe("StartPlacementAttemptUseCase", () => {
  it("assembles tiers around the self-assessed level, includes a speaking prompt, and creates the attempt", async () => {
    const itemBank: ItemBankPort = fakeItemBank({
      getBlueprint: vi.fn().mockResolvedValue(blueprint),
      assembleItems: vi.fn().mockResolvedValue([item("g1"), item("g2")]),
      getSpeakingPrompt: vi.fn().mockResolvedValue(item("speak-1")),
    });
    const attempts: AttemptRepositoryPort = fakeAttempts({
      create: vi.fn().mockResolvedValue({ id: "attempt-1", userId: "user-1", blueprintId: "blueprint-1", status: "in_progress", assembledItems: ["g1", "g2", "speak-1"] }),
    });

    const result = await new StartPlacementAttemptUseCase(itemBank, attempts).execute({
      userId: "user-1",
      selfAssessedLevel: "b1",
    });

    expect(itemBank.assembleItems).toHaveBeenCalledWith(["grammar", "vocabulary"], ["a2", "b1", "b2"], 2);
    expect(attempts.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", assembledItemIds: ["g1", "g2", "speak-1"] }),
    );
    expect(result).toEqual({ attemptId: "attempt-1", items: [item("g1"), item("g2"), item("speak-1")] });
  });

  it("still assembles a valid attempt when no speaking prompt is available", async () => {
    const itemBank: ItemBankPort = fakeItemBank({
      getBlueprint: vi.fn().mockResolvedValue(blueprint),
      assembleItems: vi.fn().mockResolvedValue([item("g1")]),
      getSpeakingPrompt: vi.fn().mockResolvedValue(null),
    });
    const attempts: AttemptRepositoryPort = fakeAttempts({
      create: vi.fn().mockResolvedValue({ id: "attempt-1", userId: "user-1", blueprintId: "blueprint-1", status: "in_progress", assembledItems: ["g1"] }),
    });

    const result = await new StartPlacementAttemptUseCase(itemBank, attempts).execute({
      userId: "user-1",
      selfAssessedLevel: "b1",
    });

    expect(result.items).toEqual([item("g1")]);
  });

  it("throws BlueprintNotFoundError when the placement blueprint isn't configured", async () => {
    const itemBank: ItemBankPort = fakeItemBank({ getBlueprint: vi.fn().mockResolvedValue(null) });
    const attempts: AttemptRepositoryPort = fakeAttempts();

    await expect(
      new StartPlacementAttemptUseCase(itemBank, attempts).execute({ userId: "user-1", selfAssessedLevel: "b1" }),
    ).rejects.toThrow(BlueprintNotFoundError);
  });
});
