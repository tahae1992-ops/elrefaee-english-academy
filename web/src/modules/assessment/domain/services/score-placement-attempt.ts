export type CefrLevel = "pre_a1" | "a1" | "a2" | "b1" | "b2" | "c1";

export const CEFR_LEVEL_ORDER: readonly CefrLevel[] = [
  "pre_a1",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
];

export interface GradedResponse {
  skill: string;
  cefrLevel: CefrLevel;
  isCorrect: boolean;
}

export interface PlacementScore {
  skillLevels: Record<string, CefrLevel>;
  overallLevel: CefrLevel;
}

/**
 * The "fixed diagnostic" scoring rule (SRS §19 — no true IRT/adaptive
 * routing at MVP, no formula was specified in any approved doc, so
 * this one is defined here explicitly and transparently): per skill,
 * a learner is placed at the highest attempted CEFR tier where they
 * scored at or above the pass threshold (the EF SET/Cambridge
 * Linguaskill pattern the Blueprint itself names as the model to
 * follow, Blueprint §3.5/§19). Overall level is the lower-median
 * across graded skills — placement tests conventionally err
 * conservative rather than overstate ability.
 */
export function scorePlacementAttempt(
  responses: readonly GradedResponse[],
  passThreshold = 0.7,
): PlacementScore {
  const skills = [...new Set(responses.map((r) => r.skill))];
  const skillLevels: Record<string, CefrLevel> = {};

  for (const skill of skills) {
    const byLevel = new Map<CefrLevel, { correct: number; total: number }>();
    for (const response of responses) {
      if (response.skill !== skill) continue;
      const bucket = byLevel.get(response.cefrLevel) ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (response.isCorrect) bucket.correct += 1;
      byLevel.set(response.cefrLevel, bucket);
    }

    let highestPassing: CefrLevel | null = null;
    for (const level of CEFR_LEVEL_ORDER) {
      const bucket = byLevel.get(level);
      if (bucket && bucket.correct / bucket.total >= passThreshold) {
        highestPassing = level;
      }
    }
    skillLevels[skill] = highestPassing ?? "pre_a1";
  }

  const sortedIndices = Object.values(skillLevels)
    .map((level) => CEFR_LEVEL_ORDER.indexOf(level))
    .sort((a, b) => a - b);
  const lowerMedianIndex = sortedIndices[Math.floor((sortedIndices.length - 1) / 2)] ?? 0;

  return { skillLevels, overallLevel: CEFR_LEVEL_ORDER[lowerMedianIndex] };
}

/**
 * Stage 2's item-assembly range: the self-assessed level plus the
 * blueprint-configured number of tiers above/below it, clamped to the
 * real CEFR range. This is what makes the diagnostic "fixed" rather
 * than adaptive — the item set is decided once, at assembly time, not
 * re-selected item-by-item from live performance.
 */
export function tiersAroundLevel(
  centerLevel: CefrLevel,
  tiersAround: number,
): CefrLevel[] {
  const centerIndex = CEFR_LEVEL_ORDER.indexOf(centerLevel);
  const start = Math.max(0, centerIndex - tiersAround);
  const end = Math.min(CEFR_LEVEL_ORDER.length - 1, centerIndex + tiersAround);
  return CEFR_LEVEL_ORDER.slice(start, end + 1);
}
