import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export interface PlacementBlueprint {
  id: string;
  itemsPerSkillPerTier: number;
  tiersAroundSelfAssessment: number;
  passThresholdPercent: number;
  gradedSkills: string[];
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
  ): Promise<{ skill: string; cefrLevel: CefrLevel; itemType: string; scoringKey: { correctOptionIndex: number } | null } | null>;
}
