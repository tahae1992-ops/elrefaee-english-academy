import type { VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

/**
 * FR-09's Main Flow step 1: "Lesson completion auto-populates notebook
 * entries." Idempotent by construction (repository-level createInitial
 * is a no-op if the (user, entry) pair is already queued) — a learner
 * revisiting a lesson's wrap-up, or a word taught in more than one
 * lesson, never resets or duplicates existing scheduler progress.
 */
export class QueueVocabularyForReviewUseCase {
  constructor(private readonly reviewStates: VocabularyReviewStateRepositoryPort) {}

  async execute(userId: string, vocabularyEntryIds: string[], now: Date): Promise<void> {
    for (const vocabularyEntryId of vocabularyEntryIds) {
      await this.reviewStates.createInitial(userId, vocabularyEntryId, now);
    }
  }
}
