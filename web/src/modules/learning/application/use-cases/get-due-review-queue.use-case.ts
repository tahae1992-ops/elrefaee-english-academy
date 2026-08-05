import type { VocabularyReviewStateRecord, VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

export interface DueReviewQueue {
  items: VocabularyReviewStateRecord[];
  dueCount: number;
}

/** API Spec §6.7: GET /review/due — today's due review queue. Returns raw scheduler records only; resolving each into displayable vocabulary content is cross-module (curriculum) and happens in the caller (see src/lib/resolve-due-review-queue.ts), same pattern as GetLessonUseCase composing with learning's progress data via a Route Handler, not the other way around. */
export class GetDueReviewQueueUseCase {
  constructor(private readonly reviewStates: VocabularyReviewStateRepositoryPort) {}

  async execute(userId: string, now: Date, limit: number): Promise<DueReviewQueue> {
    const [items, dueCount] = await Promise.all([
      this.reviewStates.findDueForUser(userId, now, limit),
      this.reviewStates.countDueForUser(userId, now),
    ]);
    return { items, dueCount };
  }
}
