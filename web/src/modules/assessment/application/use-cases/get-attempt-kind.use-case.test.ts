import { describe, expect, it, vi } from "vitest";
import { GetAttemptKindUseCase } from "./get-attempt-kind.use-case";
import { AttemptNotFoundError, AttemptNotOwnedError } from "./submit-response.use-case";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", blueprintId: "blueprint-1", status: "in_progress", assembledItems: [], ...overrides };
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
    findById: vi.fn().mockResolvedValue(fakeAttempt()),
    findInProgressByUserAndBlueprint: vi.fn(),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

describe("GetAttemptKindUseCase", () => {
  it("returns the attempt's blueprint metadata", async () => {
    const itemBank = fakeItemBank({ getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "unit_checkpoint", unitId: "unit-1", passThresholdPercent: 0.7 }) });
    const attempts = fakeAttempts();

    const result = await new GetAttemptKindUseCase(attempts, itemBank).execute("attempt-1", "user-1");

    expect(result).toEqual({ kind: "unit_checkpoint", unitId: "unit-1", passThresholdPercent: 0.7 });
  });

  it("throws AttemptNotFoundError when the attempt doesn't exist", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(null) });

    await expect(new GetAttemptKindUseCase(attempts, itemBank).execute("attempt-1", "user-1")).rejects.toThrow(AttemptNotFoundError);
  });

  it("throws AttemptNotOwnedError when the attempt belongs to someone else", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(fakeAttempt({ userId: "someone-else" })) });

    await expect(new GetAttemptKindUseCase(attempts, itemBank).execute("attempt-1", "user-1")).rejects.toThrow(AttemptNotOwnedError);
  });
});
