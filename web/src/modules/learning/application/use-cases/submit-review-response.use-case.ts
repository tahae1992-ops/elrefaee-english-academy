import type { VocabularyReviewStateRecord, VocabularyReviewStateRepositoryPort } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";
import { scheduleInitialReview, scheduleReview, type ReviewRating } from "@/modules/learning/domain/services/fsrs-scheduler";

export class ReviewItemNotFoundError extends Error {
  constructor() {
    super("This vocabulary item is not in the learner's review queue.");
    this.name = "ReviewItemNotFoundError";
  }
}

export interface SubmitReviewResponseResult {
  state: VocabularyReviewStateRecord;
  /** False when `clientEventId` matches the item's last-applied event — a duplicate/retried submission, not re-scheduled and not eligible for XP again (SAD §17's idempotency requirement, mirroring FR-18's for XP). */
  isNewEvent: boolean;
}

/**
 * API Spec §6.7: POST /review/responses. The pure scheduling math lives
 * in fsrs-scheduler.ts (domain, zero I/O); this use-case is the
 * load-mutate-save orchestration around it, scoped entirely to the
 * `learning` module's own concern (scheduler state) — XP awarding is
 * cross-module and deliberately NOT done here (see
 * src/app/api/v1/review/responses/route.ts), same boundary rule as
 * every other cross-module side effect in this codebase.
 */
export class SubmitReviewResponseUseCase {
  constructor(private readonly reviewStates: VocabularyReviewStateRepositoryPort) {}

  async execute(userId: string, vocabularyEntryId: string, rating: ReviewRating, clientEventId: string, now: Date): Promise<SubmitReviewResponseResult> {
    const prior = await this.reviewStates.findByUserAndEntry(userId, vocabularyEntryId);
    if (!prior) throw new ReviewItemNotFoundError();

    if (prior.lastEventId === clientEventId) {
      return { state: prior, isNewEvent: false };
    }

    const scheduled =
      prior.reviewCount === 0
        ? scheduleInitialReview(rating, now)
        : scheduleReview({ stability: prior.stability, difficulty: prior.difficulty }, rating, now, prior.lastReviewedAt ?? now);

    const saved = await this.reviewStates.save({
      ...prior,
      stability: scheduled.stability,
      difficulty: scheduled.difficulty,
      dueAt: scheduled.dueAt,
      lastReviewedAt: now,
      reviewCount: prior.reviewCount + 1,
      lastEventId: clientEventId,
    });

    return { state: saved, isNewEvent: true };
  }
}
