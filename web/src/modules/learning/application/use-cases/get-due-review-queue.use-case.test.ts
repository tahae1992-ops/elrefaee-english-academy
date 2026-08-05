import { describe, expect, it, vi } from "vitest";
import { GetDueReviewQueueUseCase } from "./get-due-review-queue.use-case";
import type { VocabularyReviewStateRecord, VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

function fakeRecord(id: string): VocabularyReviewStateRecord {
  return {
    id,
    userId: "user-1",
    vocabularyEntryId: `voc-${id}`,
    stability: 3,
    difficulty: 5,
    dueAt: new Date("2026-08-05T00:00:00.000Z"),
    lastReviewedAt: null,
    reviewCount: 0,
    lastEventId: null,
  };
}

describe("GetDueReviewQueueUseCase", () => {
  it("returns both the due items and the total due count", async () => {
    const items = [fakeRecord("1"), fakeRecord("2")];
    const reviewStates: VocabularyReviewStateRepositoryPort = {
      findByUserAndEntry: vi.fn(),
      findDueForUser: vi.fn().mockResolvedValue(items),
      countDueForUser: vi.fn().mockResolvedValue(18),
      createInitial: vi.fn(),
      save: vi.fn(),
      countReviewedForUser: vi.fn(),
      countMasteredForUser: vi.fn(),
    };
    const now = new Date("2026-08-05T00:00:00.000Z");

    const result = await new GetDueReviewQueueUseCase(reviewStates).execute("user-1", now, 20);

    expect(result.items).toEqual(items);
    expect(result.dueCount).toBe(18);
    expect(reviewStates.findDueForUser).toHaveBeenCalledWith("user-1", now, 20);
    expect(reviewStates.countDueForUser).toHaveBeenCalledWith("user-1", now);
  });
});
