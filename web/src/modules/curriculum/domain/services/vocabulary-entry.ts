import type { ClientMaterial } from "@/modules/curriculum/domain/services/material";

/**
 * DB Design §3.3's `curriculum.vocabulary_entries` (EDD §7's vocabulary
 * spine), reused for both genuine dictionary-style vocabulary and short
 * grammar chunks queued into spaced repetition together (EDD §5's
 * "target vocabulary/grammar chunks are queued into spaced repetition"
 * — the DB Design doc defines no separate grammar-chunk entity, so a
 * chunk is authored here with `partOfSpeech: "phrase"`).
 *
 * Pre-A1 blueprint (Rev. 3) §1/§2 — `arabicTranslation` is the Arabic
 * meaning Template 0's step 4 needs; `imageMaterialId`/`audioMaterialId`
 * (Phase 21 DB columns, never wired into this domain type until now)
 * are steps 1 and 3. `ClientVocabularyEntry` resolves those two ids
 * into real `ClientMaterial` objects the same way `VideoBlock`/
 * `ListeningBlock` resolve `materialId` — the client never sees a bare
 * id it can't do anything with.
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
  arabicTranslation?: string;
  imageMaterialId?: string;
  audioMaterialId?: string;
}

export interface ClientVocabularyEntry {
  headword: string;
  senseNumber: number;
  ipaTranscription: string;
  partOfSpeech: string;
  cefrLevel: string;
  tier: VocabularyTier;
  collocations: string[];
  synonyms: string[];
  exampleSentences: ExampleSentence[];
  arabicTranslation?: string;
  image?: ClientMaterial;
  audio?: ClientMaterial;
}

/** Resolves `imageMaterialId`/`audioMaterialId` against an already-fetched, client-safe materials map — same reference/resolve split as `lesson-blocks.ts`'s `resolveMaterialRef`. A missing lookup (material not found/not verified) resolves to `undefined` rather than throwing, since a vocabulary entry with pending media is still valid to show. */
export function toClientVocabularyEntry(entry: VocabularyEntry, resolvedMaterials: Map<string, ClientMaterial>): ClientVocabularyEntry {
  return {
    headword: entry.headword,
    senseNumber: entry.senseNumber,
    ipaTranscription: entry.ipaTranscription,
    partOfSpeech: entry.partOfSpeech,
    cefrLevel: entry.cefrLevel,
    tier: entry.tier,
    collocations: entry.collocations,
    synonyms: entry.synonyms,
    exampleSentences: entry.exampleSentences,
    arabicTranslation: entry.arabicTranslation,
    image: entry.imageMaterialId ? resolvedMaterials.get(entry.imageMaterialId) : undefined,
    audio: entry.audioMaterialId ? resolvedMaterials.get(entry.audioMaterialId) : undefined,
  };
}
