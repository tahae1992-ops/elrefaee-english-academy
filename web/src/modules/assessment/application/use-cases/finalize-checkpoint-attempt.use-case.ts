import { scoreCheckpointAttempt, type CheckpointScore } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { CheckpointResultRepositoryPort } from "@/modules/assessment/application/ports/checkpoint-result-repository-port";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";
import { CheckpointBlueprintNotFoundError } from "@/modules/assessment/application/use-cases/start-checkpoint-attempt.use-case";

export interface FinalizeCheckpointAttemptInput {
  attemptId: string;
  userId: string;
}

export interface FinalizeCheckpointAttemptResult extends CheckpointScore {
  unitId: string;
}

/** API Spec §6.5's `POST /assessment-attempts/{id}/submit`, the checkpoint-scoring branch — mirrors FinalizeAttemptUseCase's shape exactly, scoring against scoreCheckpointAttempt instead of scorePlacementAttempt. */
export class FinalizeCheckpointAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly checkpointResults: CheckpointResultRepositoryPort,
  ) {}

  async execute(input: FinalizeCheckpointAttemptInput): Promise<FinalizeCheckpointAttemptResult> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== input.userId) throw new AttemptNotOwnedError();
    if (attempt.status !== "in_progress") throw new AttemptAlreadyCompletedError();

    const meta = await this.itemBank.getBlueprintMeta(attempt.blueprintId);
    if (!meta || meta.kind !== "unit_checkpoint" || !meta.unitId) throw new CheckpointBlueprintNotFoundError();

    const responses = await this.attempts.getResponses(input.attemptId);
    const gradedResponses = responses.filter((response) => response.isCorrect !== null);

    const itemMetas = await Promise.all(gradedResponses.map((response) => this.itemBank.getItemForScoring(response.itemId)));

    const graded = [];
    for (let i = 0; i < gradedResponses.length; i++) {
      const itemMeta = itemMetas[i];
      if (!itemMeta) continue;
      graded.push({ skill: itemMeta.skill, isCorrect: gradedResponses[i].isCorrect as boolean });
    }

    const score = scoreCheckpointAttempt(graded, meta.passThresholdPercent);

    await this.checkpointResults.save({
      attemptId: input.attemptId,
      userId: input.userId,
      unitId: meta.unitId,
      scorePercent: score.scorePercent,
      passed: score.passed,
      skillBreakdown: score.skillBreakdown,
    });
    await this.attempts.markCompleted(input.attemptId);

    return { ...score, unitId: meta.unitId };
  }
}
