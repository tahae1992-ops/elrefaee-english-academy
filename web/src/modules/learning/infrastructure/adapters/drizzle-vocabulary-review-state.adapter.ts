import { and, asc, eq, lte, count } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { vocabularyReviewState } from "@/modules/learning/infrastructure/db/tables/learning";
import type {
  VocabularyReviewStateRecord,
  VocabularyReviewStateRepositoryPort,
} from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";

function toRecord(row: typeof vocabularyReviewState.$inferSelect): VocabularyReviewStateRecord {
  return {
    id: row.id,
    userId: row.userId,
    vocabularyEntryId: row.vocabularyEntryId,
    stability: row.stability,
    difficulty: row.difficulty,
    dueAt: row.dueAt,
    lastReviewedAt: row.lastReviewedAt,
    reviewCount: row.reviewCount,
    lastEventId: row.lastEventId,
  };
}

/** A brand-new item's placeholder scheduler state before its very first real review — never read as a scheduling input (SubmitReviewResponseUseCase branches on `reviewCount === 0` and calls `scheduleInitialReview` instead of trusting these). */
const NEW_ITEM_STABILITY = 0;
const NEW_ITEM_DIFFICULTY = 5;

export class DrizzleVocabularyReviewStateAdapter implements VocabularyReviewStateRepositoryPort {
  async findByUserAndEntry(userId: string, vocabularyEntryId: string): Promise<VocabularyReviewStateRecord | null> {
    const [row] = await getDb()
      .select()
      .from(vocabularyReviewState)
      .where(and(eq(vocabularyReviewState.userId, userId), eq(vocabularyReviewState.vocabularyEntryId, vocabularyEntryId)))
      .limit(1);

    return row ? toRecord(row) : null;
  }

  async findDueForUser(userId: string, asOf: Date, limit: number): Promise<VocabularyReviewStateRecord[]> {
    const rows = await getDb()
      .select()
      .from(vocabularyReviewState)
      .where(and(eq(vocabularyReviewState.userId, userId), lte(vocabularyReviewState.dueAt, asOf)))
      .orderBy(asc(vocabularyReviewState.dueAt))
      .limit(limit);

    return rows.map(toRecord);
  }

  async countDueForUser(userId: string, asOf: Date): Promise<number> {
    const [{ value }] = await getDb()
      .select({ value: count() })
      .from(vocabularyReviewState)
      .where(and(eq(vocabularyReviewState.userId, userId), lte(vocabularyReviewState.dueAt, asOf)));

    return value;
  }

  async createInitial(userId: string, vocabularyEntryId: string, now: Date): Promise<VocabularyReviewStateRecord> {
    const [row] = await getDb()
      .insert(vocabularyReviewState)
      .values({
        userId,
        vocabularyEntryId,
        stability: NEW_ITEM_STABILITY,
        difficulty: NEW_ITEM_DIFFICULTY,
        dueAt: now,
        lastReviewedAt: null,
        reviewCount: 0,
        lastEventId: null,
      })
      .onConflictDoNothing({ target: [vocabularyReviewState.userId, vocabularyReviewState.vocabularyEntryId] })
      .returning();

    if (row) return toRecord(row);

    // Already queued (e.g. this word appears in more than one lesson, or the learner revisited a wrap-up) — return the existing row untouched.
    const existing = await this.findByUserAndEntry(userId, vocabularyEntryId);
    if (!existing) throw new Error(`vocabulary_review_state row for (${userId}, ${vocabularyEntryId}) unexpectedly missing after a conflicting insert.`);
    return existing;
  }

  async save(record: VocabularyReviewStateRecord): Promise<VocabularyReviewStateRecord> {
    const [row] = await getDb()
      .update(vocabularyReviewState)
      .set({
        stability: record.stability,
        difficulty: record.difficulty,
        dueAt: record.dueAt,
        lastReviewedAt: record.lastReviewedAt,
        reviewCount: record.reviewCount,
        lastEventId: record.lastEventId,
      })
      .where(eq(vocabularyReviewState.id, record.id))
      .returning();

    return toRecord(row);
  }
}
