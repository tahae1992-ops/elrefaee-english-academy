/**
 * Phase 21 — externally-sourced educational media (video/image/audio),
 * authored as a `curriculum.content_items` row (`type='material'`)
 * exactly like every other content kind, referenced by id from lesson
 * blocks. No secret/answer-key to strip for the client — every field
 * here is meant to be shown or credited to the learner, so
 * `ClientMaterial` is the same shape as `Material` (matching
 * vocabulary-entry.ts's identical no-op `toClientVocabularyEntry`
 * pattern for the same reason).
 *
 * `license`/`attribution` exist because this project's own rule is
 * explicit: never invent a URL, never misuse copyrighted media — a
 * material authored without a real, verifiable source has no business
 * being referenced by a lesson block at all.
 */

export type MaterialType = "video" | "image" | "audio";

export interface Material {
  mediaType: MaterialType;
  title: string;
  /** Human-readable origin, e.g. "Wikimedia Commons", "YouTube — BBC Learning English". */
  source: string;
  /** The canonical/watch/original URL. */
  url: string;
  /** Only set for video: the iframe-embeddable URL, distinct from the watch URL. */
  embedUrl?: string;
  license?: string;
  attribution?: string;
  thumbnailUrl?: string;
}

export type ClientMaterial = Material;

export function toClientMaterial(material: Material): ClientMaterial {
  return material;
}
