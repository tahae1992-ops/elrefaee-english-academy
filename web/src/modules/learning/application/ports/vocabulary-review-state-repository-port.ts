export interface VocabularyReviewStateRecord {
  id: string;
  userId: string;
  vocabularyEntryId: string;
  stability: number;
  difficulty: number;
  dueAt: Date;
  lastReviewedAt: Date | null;
  reviewCount: number;
  lastEventId: string | null;
}

export interface VocabularyReviewStateRepositoryPort {
  findByUserAndEntry(userId: string, vocabularyEntryId: string): Promise<VocabularyReviewStateRecord | null>;
  /** Due items (`dueAt <= asOf`), soonest-due first, capped at `limit`. */
  findDueForUser(userId: string, asOf: Date, limit: number): Promise<VocabularyReviewStateRecord[]>;
  countDueForUser(userId: string, asOf: Date): Promise<number>;
  /** Idempotent: creates a fresh "new" row (due immediately) unless one already exists for this (user, entry) pair, in which case the existing row is returned untouched. */
  createInitial(userId: string, vocabularyEntryId: string, now: Date): Promise<VocabularyReviewStateRecord>;
  save(record: VocabularyReviewStateRecord): Promise<VocabularyReviewStateRecord>;
}
