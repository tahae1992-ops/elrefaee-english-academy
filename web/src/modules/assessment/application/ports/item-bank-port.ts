import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export interface PlacementBlueprint {
  id: string;
  itemsPerSkillPerTier: number;
  tiersAroundSelfAssessment: number;
  passThresholdPercent: number;
  gradedSkills: string[];
}

export interface CheckpointBlueprint {
  id: string;
  unitId: string;
  itemCount: number;
  passThresholdPercent: number;
  skills: string[];
}

/** What a route handler needs to dispatch `/assessment-attempts/{id}/submit` and `/{id}` to the right (placement vs. checkpoint) use-case, without either module reaching into the other's internals. */
export interface AttemptBlueprintMeta {
  kind: "placement" | "unit_checkpoint";
  unitId: string | null;
  passThresholdPercent: number;
}

/** Client-safe shape — deliberately excludes `scoringKey`. */
export interface AssessmentItem {
  id: string;
  skill: string;
  cefrLevel: CefrLevel;
  itemType: string;
  prompt: Record<string, unknown>;
}

export interface ItemBankPort {
  getBlueprint(key: string): Promise<PlacementBlueprint | null>;

  /** Assembles Stage 2's fixed item set: N items per skill per requested tier. */
  assembleItems(
    skills: string[],
    tiers: CefrLevel[],
    itemsPerSkillPerTier: number,
  ): Promise<AssessmentItem[]>;

  /** One representative Speaking prompt nearest the given level — optional, ungraded. */
  getSpeakingPrompt(nearLevel: CefrLevel): Promise<AssessmentItem | null>;

  /**
   * Server-only — `scoringKey` is never exposed to the client. One
   * query instead of two (skill/level/type + scoringKey used to be
   * separate calls hitting the same row) — each Session Pooler round
   * trip in this environment costs ~1.5-2s, so collapsing redundant
   * queries measurably matters for response-submission latency.
   */
  getItemForScoring(
    itemId: string,
  ): Promise<{ skill: string; cefrLevel: CefrLevel; itemType: string; scoringKey: { correctOptionIndex: number; explanation?: string } | null } | null>;

  /** FR-06/FR-08: the one checkpoint blueprint for a unit, if items have been authored for it. */
  getCheckpointBlueprint(unitId: string): Promise<CheckpointBlueprint | null>;

  /** All items authored for this unit's checkpoint (unlike placement, the full set is used every attempt — no per-attempt sampling at this MVP scope). */
  assembleCheckpointItems(unitId: string, itemCount: number): Promise<AssessmentItem[]>;

  /** Resume path: re-fetch the client-safe shape of an already-assembled item set by id, in the given order. */
  getItemsByIds(itemIds: string[]): Promise<AssessmentItem[]>;

  /** What `/assessment-attempts/{id}/submit` and `/{id}` need to dispatch to the right scoring path. */
  getBlueprintMeta(blueprintId: string): Promise<AttemptBlueprintMeta | null>;
}
