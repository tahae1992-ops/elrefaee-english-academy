export interface CheckpointGradedResponse {
  skill: string;
  isCorrect: boolean;
}

export interface SkillBreakdownEntry {
  correct: number;
  total: number;
}

export interface CheckpointScore {
  scorePercent: number;
  passed: boolean;
  skillBreakdown: Record<string, SkillBreakdownEntry>;
}

/**
 * FR-08's checkpoint scoring rule: simple percent-correct against the
 * blueprint's own pass threshold (SRS FR-06: "Checkpoint pass threshold
 * is defined per the unit's test_blueprint, not hardcoded per unit") --
 * deliberately simpler than placement's CEFR-tiered algorithm
 * (score-placement-attempt.ts), since a checkpoint is a binary
 * pass/fail mastery gate for one unit, not a level-placement decision.
 * The per-skill breakdown is what FR-06's exception flow needs:
 * "surfaces exactly which skill(s) fell below threshold."
 */
export function scoreCheckpointAttempt(
  responses: readonly CheckpointGradedResponse[],
  passThresholdPercent: number,
): CheckpointScore {
  const skillBreakdown: Record<string, SkillBreakdownEntry> = {};
  let correctCount = 0;

  for (const response of responses) {
    const entry = skillBreakdown[response.skill] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (response.isCorrect) {
      entry.correct += 1;
      correctCount += 1;
    }
    skillBreakdown[response.skill] = entry;
  }

  const scorePercent = responses.length === 0 ? 0 : Math.round((correctCount / responses.length) * 100);
  const passed = responses.length > 0 && correctCount / responses.length >= passThresholdPercent;

  return { scorePercent, passed, skillBreakdown };
}
