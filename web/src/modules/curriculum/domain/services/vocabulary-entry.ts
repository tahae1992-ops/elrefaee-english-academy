/**
 * DB Design §3.3's `curriculum.vocabulary_entries` (EDD §7's vocabulary
 * spine), reused for both genuine dictionary-style vocabulary and short
 * grammar chunks queued into spaced repetition together (EDD §5's
 * "target vocabulary/grammar chunks are queued into spaced repetition"
 * — the DB Design doc defines no separate grammar-chunk entity, so a
 * chunk is authored here with `partOfSpeech: "phrase"`).
 *
 * Unlike Exercise (exercise.ts), a vocabulary entry has no answer key
 * to strip for the client — every field here is meant to be shown to
 * the learner. `ClientVocabularyEntry` still exists as a distinct type
 * (rather than reusing `VocabularyEntry` directly at the interface
 * layer) for consistency with the rest of this module's
 * domain/interface separation, and as the natural seam if a
 * server-only field is ever added later.
 */

export type VocabularyTier = "active" | "receptive";

export interface ExampleSentence {
  text: string;
}

export interface VocabularyEntry {
  headword: string;
  senseNumber: number;
  ipaTranscription: string;
  partOfSpeech: string;
  cefrLevel: string;
  tier: VocabularyTier;
  collocations: string[];
  synonyms: string[];
  exampleSentences: ExampleSentence[];
}

export type ClientVocabularyEntry = VocabularyEntry;

export function toClientVocabularyEntry(entry: VocabularyEntry): ClientVocabularyEntry {
  return entry;
}
