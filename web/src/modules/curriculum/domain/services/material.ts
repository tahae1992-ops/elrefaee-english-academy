/**
 * Phase 21 — externally-sourced educational media (video/image/audio),
 * authored as a `curriculum.content_items` row (`type='material'`)
 * exactly like every other content kind, referenced by id from lesson
 * blocks and vocabulary entries. No secret/answer-key to strip for the
 * client — every field here is meant to be shown or credited to the
 * learner, so `ClientMaterial` is the same shape as `Material`
 * (matching vocabulary-entry.ts's identical no-op pattern for the same
 * reason).
 *
 * Pre-A1 blueprint (Rev. 3) §3 — `verificationStatus`/`isHumanVoice`/
 * `embedAllowed` exist because a URL merely existing is not
 * verification: a human must confirm it resolves, is legally
 * embeddable, and that its license/attribution are recorded before a
 * lesson block may reference it (enforced in
 * DrizzleMaterialAdapter.listByIds — only VERIFIED rows are ever
 * resolvable). `isHumanVoice` may only be set true once a human
 * recording has actually been verified — AI-generated speech must
 * never carry it.
 */

export type MaterialType = "video" | "image" | "audio";

export type MaterialVerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface Material {
  mediaType: MaterialType;
  title: string;
  /** Rights-holder / content origin, e.g. "BBC Learning English". */
  source: string;
  /** Hosting platform, e.g. "YouTube", "Wikimedia Commons", "Internal recording" — distinct from `source` since a rights-holder's content is often hosted elsewhere. */
  provider: string;
  /** The canonical/watch/original URL. */
  sourceUrl: string;
  /** Only set for video: the iframe-embeddable URL, distinct from the watch URL. */
  embedUrl?: string;
  license?: string;
  attribution?: string;
  thumbnailUrl?: string;
  verificationStatus: MaterialVerificationStatus;
  /** Audio only. True only once a human has confirmed the recording is human-spoken — never defaults to true, never set for AI-generated speech. */
  isHumanVoice?: boolean;
  /** Video/audio only. Explicit confirmation the source's terms permit embedding — separate from `verificationStatus`, since a resource can exist and work but still forbid embedding. */
  embedAllowed?: boolean;
}

export type ClientMaterial = Material;

export function toClientMaterial(material: Material): ClientMaterial {
  return material;
}
