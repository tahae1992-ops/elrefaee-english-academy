import { createGetDueReviewQueueUseCase, createDrizzleVocabularyEntryAdapter } from "@/composition-root";
import { deriveReviewState } from "@/modules/learning/interface/types";
import type { ReviewLearningState } from "@/modules/learning/interface/types";
import type { ClientVocabularyEntry } from "@/modules/curriculum/interface/types";

export interface ClientReviewQueueItem {
  vocabularyEntryId: string;
  entry: ClientVocabularyEntry;
  state: ReviewLearningState;
  dueAt: string;
}

export interface DueReviewQueueSnapshot {
  items: ClientReviewQueueItem[];
  dueCount: number;
}

/**
 * The one DB-backed composition point combining `learning`'s due
 * scheduler state with `curriculum`'s vocabulary content — same
 * cross-module-orchestration-lives-in-a-shared-lib-file rule as
 * resolve-course-progress.ts/gate-lesson-access.ts. Used by both the
 * Dashboard's pending-reviews widget (dueCount only) and the review
 * session route (the full `items` list).
 */
export async function resolveDueReviewQueue(userId: string, now: Date, limit: number): Promise<DueReviewQueueSnapshot> {
  const { items, dueCount } = await createGetDueReviewQueueUseCase().execute(userId, now, limit);

  const vocabularyEntryIds = items.map((item) => item.vocabularyEntryId);
  const entries = await createDrizzleVocabularyEntryAdapter().listByIds(vocabularyEntryIds);

  const resolved: ClientReviewQueueItem[] = items.flatMap((item) => {
    const entry = entries.get(item.vocabularyEntryId);
    if (!entry) return [];
    return [
      {
        vocabularyEntryId: item.vocabularyEntryId,
        entry,
        state: deriveReviewState(item.reviewCount, item.stability),
        dueAt: item.dueAt.toISOString(),
      },
    ];
  });

  return { items: resolved, dueCount };
}
