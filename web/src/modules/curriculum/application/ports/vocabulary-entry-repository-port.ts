import type { VocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";

export interface VocabularyEntryRepositoryPort {
  getById(vocabularyEntryId: string): Promise<VocabularyEntry | null>;
  /** Batch fetch for resolving a lesson's `targetVocabularyIds` or a review queue's item ids in one query. */
  listByIds(vocabularyEntryIds: string[]): Promise<Map<string, VocabularyEntry>>;
}
