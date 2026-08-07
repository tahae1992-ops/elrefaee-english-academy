import { describe, expect, it, vi } from "vitest";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
  ItemAlreadyAnsweredError,
  SubmitResponseUseCase,
} from "./submit-response.use-case";
import type { AttemptRepositoryPort, AttemptRecord } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", blueprintId: "blueprint-1", status: "in_progress", assembledItems: ["item-1"], ...overrides };
}

function buildPorts(overrides: { itemBank?: Partial<ItemBankPort>; attempts?: Partial<AttemptRepositoryPort> } = {}) {
  const itemBank: ItemBankPort = {
    getBlueprint: vi.fn(),
    assembleItems: vi.fn(),
    getSpeakingPrompt: vi.fn(),
    getItemForScoring: vi
      .fn()
      .mockResolvedValue({ skill: "grammar", cefrLevel: "b1", itemType: "multiple_choice", scoringKey: { correctOptionIndex: 1 } }),
    getCheckpointBlueprint: vi.fn(),
    assembleCheckpointItems: vi.fn(),
    getItemsByIds: vi.fn(),
    getBlueprintMeta: vi.fn(),
    getCertificationBlueprint: vi.fn(),
    assembleCertificationItems: vi.fn(),
    ...overrides.itemBank,
  };
  const attempts: AttemptRepositoryPort = {
    create: vi.fn(),
    findById: vi.fn().mockResolvedValue(fakeAttempt()),
    findInProgressByUserAndBlueprint: vi.fn(),
    hasResponseForItem: vi.fn().mockResolvedValue(false),
    recordResponse: vi.fn().mockResolvedValue(undefined),
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides.attempts,
  };
  return { itemBank, attempts };
}

describe("SubmitResponseUseCase", () => {
  it("scores a multiple_choice response against the scoring key and records it", async () => {
    const { itemBank, attempts } = buildPorts();
    const useCase = new SubmitResponseUseCase(itemBank, attempts);

    await useCase.execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: { selectedOptionIndex: 1 } });

    expect(attempts.recordResponse).toHaveBeenCalledWith({
      attemptId: "attempt-1",
      itemId: "item-1",
      responsePayload: { selectedOptionIndex: 1 },
      isCorrect: true,
      scoredBy: "auto",
    });
  });

  it("records an incorrect multiple_choice answer as isCorrect: false", async () => {
    const { itemBank, attempts } = buildPorts();
    const useCase = new SubmitResponseUseCase(itemBank, attempts);

    await useCase.execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: { selectedOptionIndex: 0 } });

    expect(attempts.recordResponse).toHaveBeenCalledWith(expect.objectContaining({ isCorrect: false }));
  });

  it("records a free_text (Speaking) response as ungraded, scoredBy human", async () => {
    const { itemBank, attempts } = buildPorts({
      itemBank: {
        getItemForScoring: vi
          .fn()
          .mockResolvedValue({ skill: "speaking", cefrLevel: "b1", itemType: "free_text", scoringKey: null }),
      },
    });
    const useCase = new SubmitResponseUseCase(itemBank, attempts);

    await useCase.execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: { text: "hello" } });

    expect(attempts.recordResponse).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: null, scoredBy: "human" }),
    );
  });

  it("returns nothing when revealCorrectness is not set (Placement Test's Stage 2 contract)", async () => {
    const { itemBank, attempts } = buildPorts();
    const useCase = new SubmitResponseUseCase(itemBank, attempts);

    const result = await useCase.execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: { selectedOptionIndex: 1 } });

    expect(result).toBeUndefined();
  });

  it("returns isCorrect + explanation when revealCorrectness is set (Unit Checkpoint's immediate-feedback contract)", async () => {
    const { itemBank, attempts } = buildPorts({
      itemBank: {
        getItemForScoring: vi
          .fn()
          .mockResolvedValue({ skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", scoringKey: { correctOptionIndex: 1, explanation: "Use 'is' with she/he/it." } }),
      },
    });
    const useCase = new SubmitResponseUseCase(itemBank, attempts);

    const result = await useCase.execute({
      attemptId: "attempt-1",
      userId: "user-1",
      itemId: "item-1",
      responsePayload: { selectedOptionIndex: 1 },
      revealCorrectness: true,
    });

    expect(result).toEqual({ isCorrect: true, explanation: "Use 'is' with she/he/it." });
  });

  it("throws AttemptNotOwnedError when the attempt belongs to a different user", async () => {
    const { itemBank, attempts } = buildPorts({ attempts: { findById: vi.fn().mockResolvedValue(fakeAttempt({ userId: "someone-else" })) } });

    await expect(
      new SubmitResponseUseCase(itemBank, attempts).execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: {} }),
    ).rejects.toThrow(AttemptNotOwnedError);
  });

  it("throws AttemptAlreadyCompletedError when the attempt is no longer in progress", async () => {
    const { itemBank, attempts } = buildPorts({ attempts: { findById: vi.fn().mockResolvedValue(fakeAttempt({ status: "completed" })) } });

    await expect(
      new SubmitResponseUseCase(itemBank, attempts).execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: {} }),
    ).rejects.toThrow(AttemptAlreadyCompletedError);
  });

  it("throws AttemptNotFoundError when the item wasn't part of this attempt's assembled set", async () => {
    const { itemBank, attempts } = buildPorts();

    await expect(
      new SubmitResponseUseCase(itemBank, attempts).execute({ attemptId: "attempt-1", userId: "user-1", itemId: "unassembled-item", responsePayload: {} }),
    ).rejects.toThrow(AttemptNotFoundError);
  });

  it("throws ItemAlreadyAnsweredError on a duplicate submission for the same item", async () => {
    const { itemBank, attempts } = buildPorts({ attempts: { hasResponseForItem: vi.fn().mockResolvedValue(true) } });

    await expect(
      new SubmitResponseUseCase(itemBank, attempts).execute({ attemptId: "attempt-1", userId: "user-1", itemId: "item-1", responsePayload: {} }),
    ).rejects.toThrow(ItemAlreadyAnsweredError);
  });
});
