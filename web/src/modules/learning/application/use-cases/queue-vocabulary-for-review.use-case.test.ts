import { describe, expect, it, vi } from "vitest";
import { QueueVocabularyForReviewUseCase } from "./queue-vocabulary-for-review.use-case";
import type { VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

describe("QueueVocabularyForReviewUseCase", () => {
  it("calls createInitial once per vocabularyEntryId", async () => {
    const createInitial = vi.fn().mockResolvedValue(undefined);
    const reviewStates: VocabularyReviewStateRepositoryPort = {
      findByUserAndEntry: vi.fn(),
      findDueForUser: vi.fn(),
      countDueForUser: vi.fn(),
      createInitial,
      save: vi.fn(),
      countReviewedForUser: vi.fn(),
      countMasteredForUser: vi.fn(),
    };
    const now = new Date("2026-08-05T00:00:00.000Z");

    await new QueueVocabularyForReviewUseCase(reviewStates).execute("user-1", ["voc-1", "voc-2"], now);

    expect(createInitial).toHaveBeenCalledTimes(2);
    expect(createInitial).toHaveBeenNthCalledWith(1, "user-1", "voc-1", now);
    expect(createInitial).toHaveBeenNthCalledWith(2, "user-1", "voc-2", now);
  });

  it("does nothing for an empty id list", async () => {
    const createInitial = vi.fn();
    const reviewStates: VocabularyReviewStateRepositoryPort = {
      findByUserAndEntry: vi.fn(),
      findDueForUser: vi.fn(),
      countDueForUser: vi.fn(),
      createInitial,
      save: vi.fn(),
      countReviewedForUser: vi.fn(),
      countMasteredForUser: vi.fn(),
    };

    await new QueueVocabularyForReviewUseCase(reviewStates).execute("user-1", [], new Date());

    expect(createInitial).not.toHaveBeenCalled();
  });
});
