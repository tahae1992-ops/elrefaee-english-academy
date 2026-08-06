import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { itemBank, testBlueprints } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import type {
  AssessmentItem,
  AttemptBlueprintMeta,
  CheckpointBlueprint,
  ItemBankPort,
  PlacementBlueprint,
} from "@/modules/assessment/application/ports/item-bank-port";

interface CheckpointBlueprintRules {
  itemCount: number;
  passThresholdPercent: number;
  skills: string[];
}

interface BlueprintRules {
  itemsPerSkillPerTier: number;
  tiersAroundSelfAssessment: number;
  passThresholdPercent: number;
  gradedSkills: string[];
}

function toAssessmentItem(row: {
  id: string;
  skill: string;
  cefrLevel: CefrLevel;
  itemType: string;
  prompt: unknown;
}): AssessmentItem {
  return {
    id: row.id,
    skill: row.skill,
    cefrLevel: row.cefrLevel,
    itemType: row.itemType,
    prompt: row.prompt as Record<string, unknown>,
  };
}

export class DrizzleItemBankAdapter implements ItemBankPort {
  async getBlueprint(key: string): Promise<PlacementBlueprint | null> {
    const [row] = await getDb()
      .select({ id: testBlueprints.id, rules: testBlueprints.rules })
      .from(testBlueprints)
      .where(eq(testBlueprints.key, key))
      .limit(1);

    if (!row) return null;
    const rules = row.rules as BlueprintRules;
    return {
      id: row.id,
      itemsPerSkillPerTier: rules.itemsPerSkillPerTier,
      tiersAroundSelfAssessment: rules.tiersAroundSelfAssessment,
      passThresholdPercent: rules.passThresholdPercent,
      gradedSkills: rules.gradedSkills,
    };
  }

  async assembleItems(
    skills: string[],
    tiers: CefrLevel[],
    itemsPerSkillPerTier: number,
  ): Promise<AssessmentItem[]> {
    // One query for every matching row across all (skill, tier) pairs,
    // then cap per-group client-side — this used to be a query PER
    // pair (up to 12 sequential round trips, ~1.5-2s each over the
    // Session Pooler in this environment, adding up to several
    // seconds just to start an attempt). The seeded item bank is small
    // enough (a few hundred rows at most) that filtering client-side
    // after one fetch is both simpler and dramatically faster than
    // paying per-pair round-trip latency.
    const rows = await getDb()
      .select({
        id: itemBank.id,
        skill: itemBank.skill,
        cefrLevel: itemBank.cefrLevel,
        itemType: itemBank.itemType,
        prompt: itemBank.prompt,
      })
      .from(itemBank)
      .where(and(inArray(itemBank.skill, skills as never[]), inArray(itemBank.cefrLevel, tiers)));

    const counts = new Map<string, number>();
    const results: AssessmentItem[] = [];
    for (const row of rows) {
      const groupKey = `${row.skill}:${row.cefrLevel}`;
      const countSoFar = counts.get(groupKey) ?? 0;
      if (countSoFar >= itemsPerSkillPerTier) continue;
      counts.set(groupKey, countSoFar + 1);
      results.push(toAssessmentItem(row));
    }
    return results;
  }

  async getSpeakingPrompt(nearLevel: CefrLevel): Promise<AssessmentItem | null> {
    // The seeded Speaking set is tiny (3 prompts) — fetch it all in
    // one query and pick the best match client-side, rather than a
    // query-then-fallback-query pair.
    const rows = await getDb()
      .select({
        id: itemBank.id,
        skill: itemBank.skill,
        cefrLevel: itemBank.cefrLevel,
        itemType: itemBank.itemType,
        prompt: itemBank.prompt,
      })
      .from(itemBank)
      .where(eq(itemBank.skill, "speaking"));

    if (rows.length === 0) return null;
    const exact = rows.find((row) => row.cefrLevel === nearLevel);
    return toAssessmentItem(exact ?? rows[0]);
  }

  async getItemForScoring(
    itemId: string,
  ): Promise<{ skill: string; cefrLevel: CefrLevel; itemType: string; scoringKey: { correctOptionIndex: number; explanation?: string } | null } | null> {
    const [row] = await getDb()
      .select({
        skill: itemBank.skill,
        cefrLevel: itemBank.cefrLevel,
        itemType: itemBank.itemType,
        scoringKey: itemBank.scoringKey,
      })
      .from(itemBank)
      .where(eq(itemBank.id, itemId))
      .limit(1);

    if (!row) return null;
    return {
      skill: row.skill,
      cefrLevel: row.cefrLevel,
      itemType: row.itemType,
      scoringKey: (row.scoringKey as { correctOptionIndex: number; explanation?: string } | null) ?? null,
    };
  }

  async getCheckpointBlueprint(unitId: string): Promise<CheckpointBlueprint | null> {
    const [row] = await getDb()
      .select({ id: testBlueprints.id, unitId: testBlueprints.unitId, rules: testBlueprints.rules })
      .from(testBlueprints)
      .where(and(eq(testBlueprints.unitId, unitId), eq(testBlueprints.kind, "unit_checkpoint")))
      .limit(1);

    if (!row || !row.unitId) return null;
    const rules = row.rules as CheckpointBlueprintRules;
    return { id: row.id, unitId: row.unitId, itemCount: rules.itemCount, passThresholdPercent: rules.passThresholdPercent, skills: rules.skills };
  }

  async assembleCheckpointItems(unitId: string, itemCount: number): Promise<AssessmentItem[]> {
    // The full authored set is used every attempt at this MVP scope
    // (no per-attempt sampling, unlike placement's tiered assembly) —
    // `itemCount` is the blueprint's own declared size, used here only
    // as a defensive cap in case the item bank ever grows past it.
    const rows = await getDb()
      .select({ id: itemBank.id, skill: itemBank.skill, cefrLevel: itemBank.cefrLevel, itemType: itemBank.itemType, prompt: itemBank.prompt })
      .from(itemBank)
      .where(eq(itemBank.unitId, unitId))
      .limit(itemCount);

    return rows.map(toAssessmentItem);
  }

  async getItemsByIds(itemIds: string[]): Promise<AssessmentItem[]> {
    if (itemIds.length === 0) return [];
    const rows = await getDb()
      .select({ id: itemBank.id, skill: itemBank.skill, cefrLevel: itemBank.cefrLevel, itemType: itemBank.itemType, prompt: itemBank.prompt })
      .from(itemBank)
      .where(inArray(itemBank.id, itemIds));

    const byId = new Map(rows.map((row) => [row.id, toAssessmentItem(row)]));
    return itemIds.map((id) => byId.get(id)).filter((item): item is AssessmentItem => item !== undefined);
  }

  async getBlueprintMeta(blueprintId: string): Promise<AttemptBlueprintMeta | null> {
    const [row] = await getDb()
      .select({ kind: testBlueprints.kind, unitId: testBlueprints.unitId, rules: testBlueprints.rules })
      .from(testBlueprints)
      .where(eq(testBlueprints.id, blueprintId))
      .limit(1);

    if (!row) return null;
    const kind = row.kind as AttemptBlueprintMeta["kind"];
    const rules = row.rules as { passThresholdPercent: number };
    return { kind, unitId: row.unitId, passThresholdPercent: rules.passThresholdPercent };
  }
}
