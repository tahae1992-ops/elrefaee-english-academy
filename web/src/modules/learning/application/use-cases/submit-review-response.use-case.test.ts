import { describe, expect, it, vi } from "vitest";
import { ReviewItemNotFoundError, SubmitReviewResponseUseCase } from "./submit-review-response.use-case";
import type { VocabularyReviewStateRecord, VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

const NOW = new Date("2026-08-05T00:00:00.000Z");

function fakeRecord(overrides: Partial<VocabularyReviewStateRecord> = {}): VocabularyReviewStateRecord {
  return {
    id: "state-1",
    userId: "user-1",
    vocabularyEntryId: "voc-1",
    stability: 0,
    difficulty: 5,
    dueAt: NOW,
    lastReviewedAt: null,
    reviewCount: 0,
    lastEventId: null,
    ...overrides,
  };
}

function fakeRepo(record: VocabularyReviewStateRecord | null): VocabularyReviewStateRepositoryPort & { save: ReturnType<typeof vi.fn> } {
  const save = vi.fn().mockImplementation(async (r: VocabularyReviewStateRecord) => r);
  return {
    findByUserAndEntry: vi.fn().mockResolvedValue(record),
    findDueForUser: vi.fn(),
    countDueForUser: vi.fn(),
    createInitial: vi.fn(),
    save,
    countReviewedForUser: vi.fn(),
    countMasteredForUser: vi.fn(),
  };
}

describe("SubmitReviewResponseUseCase", () => {
  it("throws ReviewItemNotFoundError when the item isn't queued for this learner", async () => {
    const repo = fakeRepo(null);
    await expect(new SubmitReviewResponseUseCase(repo).execute("user-1", "voc-1", "good", "event-1", NOW)).rejects.toThrow(
      ReviewItemNotFoundError,
    );
  });

  it("schedules a brand-new item's very first review and increments reviewCount", async () => {
    const repo = fakeRepo(fakeRecord());

    const result = await new SubmitReviewResponseUseCase(repo).execute("user-1", "voc-1", "good", "event-1", NOW);

    expect(result.isNewEvent).toBe(true);
    expect(result.state.reviewCount).toBe(1);
    expect(result.state.lastReviewedAt).toEqual(NOW);
    expect(result.state.lastEventId).toBe("event-1");
    expect(result.state.stability).toBeGreaterThan(0);
  });

  it("schedules a subsequent review using the prior stability/difficulty", async () => {
    const lastReviewedAt = new Date(NOW.getTime() - 3 * 86_400_000);
    const repo = fakeRepo(fakeRecord({ reviewCount: 2, stability: 3, difficulty: 5, lastReviewedAt }));

    const result = await new SubmitReviewResponseUseCase(repo).execute("user-1", "voc-1", "good", "event-2", NOW);

    expect(result.state.reviewCount).toBe(3);
    expect(result.state.stability).toBeGreaterThan(3);
  });

  it("is idempotent: replaying the same clientEventId does not re-schedule or increment reviewCount", async () => {
    const priorlyApplied = fakeRecord({ reviewCount: 1, stability: 3, lastEventId: "event-1", lastReviewedAt: NOW });
    const repo = fakeRepo(priorlyApplied);

    const result = await new SubmitReviewResponseUseCase(repo).execute("user-1", "voc-1", "good", "event-1", NOW);

    expect(result.isNewEvent).toBe(false);
    expect(result.state).toEqual(priorlyApplied);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("collapses stability toward a lapse when rated 'again'", async () => {
    const lastReviewedAt = new Date(NOW.getTime() - 3 * 86_400_000);
    const repo = fakeRepo(fakeRecord({ reviewCount: 2, stability: 3, difficulty: 5, lastReviewedAt }));

    const result = await new SubmitReviewResponseUseCase(repo).execute("user-1", "voc-1", "again", "event-2", NOW);

    expect(result.state.stability).toBeLessThan(3);
  });
});
