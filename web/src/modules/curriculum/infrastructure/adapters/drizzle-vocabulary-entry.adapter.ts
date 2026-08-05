import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems, vocabularyEntries } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { VocabularyEntryRepositoryPort } from "@/modules/curriculum/application/ports/vocabulary-entry-repository-port";
import type { ExampleSentence, VocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";

function toDomain(row: {
  headword: string;
  senseNumber: number;
  ipaTranscription: string;
  partOfSpeech: string;
  cefrLevel: string;
  tier: string;
  collocations: string[];
  synonyms: string[];
  exampleSentences: unknown;
}): VocabularyEntry {
  return {
    headword: row.headword,
    senseNumber: row.senseNumber,
    ipaTranscription: row.ipaTranscription,
    partOfSpeech: row.partOfSpeech,
    cefrLevel: row.cefrLevel,
    tier: row.tier as VocabularyEntry["tier"],
    collocations: row.collocations,
    synonyms: row.synonyms,
    exampleSentences: row.exampleSentences as ExampleSentence[],
  };
}

const SELECTED_COLUMNS = {
  id: vocabularyEntries.id,
  headword: vocabularyEntries.headword,
  senseNumber: vocabularyEntries.senseNumber,
  ipaTranscription: vocabularyEntries.ipaTranscription,
  partOfSpeech: vocabularyEntries.partOfSpeech,
  cefrLevel: vocabularyEntries.cefrLevel,
  tier: vocabularyEntries.tier,
  collocations: vocabularyEntries.collocations,
  synonyms: vocabularyEntries.synonyms,
  exampleSentences: vocabularyEntries.exampleSentences,
};

export class DrizzleVocabularyEntryAdapter implements VocabularyEntryRepositoryPort {
  async getById(vocabularyEntryId: string): Promise<VocabularyEntry | null> {
    const [row] = await getDb()
      .select(SELECTED_COLUMNS)
      .from(vocabularyEntries)
      .innerJoin(contentItems, eq(contentItems.id, vocabularyEntries.contentItemId))
      .where(and(eq(vocabularyEntries.id, vocabularyEntryId), eq(contentItems.status, "published")))
      .limit(1);

    return row ? toDomain(row) : null;
  }

  async listByIds(vocabularyEntryIds: string[]): Promise<Map<string, VocabularyEntry>> {
    if (vocabularyEntryIds.length === 0) return new Map();

    const rows = await getDb()
      .select(SELECTED_COLUMNS)
      .from(vocabularyEntries)
      .innerJoin(contentItems, eq(contentItems.id, vocabularyEntries.contentItemId))
      .where(and(inArray(vocabularyEntries.id, vocabularyEntryIds), eq(contentItems.status, "published")));

    return new Map(rows.map((row) => [row.id, toDomain(row)]));
  }
}
