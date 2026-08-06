import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";
import type { CheckpointResultRepositoryPort } from "@/modules/assessment/application/ports/checkpoint-result-repository-port";
import type { PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { CheckpointScore } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";

export interface AttemptStatus {
  status: "in_progress" | "completed" | "abandoned";
  kind: "placement" | "unit_checkpoint";
  result: PlacementScore | CheckpointScore | null;
}

/** API Spec §6.5's `GET /assessment-attempts/{id}` — dispatches to the right result repository by the attempt's own blueprint kind, so one endpoint serves both Placement and Unit Checkpoint attempts. */
export class GetAttemptStatusUseCase {
  constructor(
    private readonly attempts: AttemptRepositoryPort,
    private readonly itemBank: ItemBankPort,
    private readonly results: ResultRepositoryPort,
    private readonly checkpointResults: CheckpointResultRepositoryPort,
  ) {}

  async execute(attemptId: string, userId: string): Promise<AttemptStatus> {
    const attempt = await this.attempts.findById(attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== userId) throw new AttemptNotOwnedError();

    const meta = await this.itemBank.getBlueprintMeta(attempt.blueprintId);

    if (meta?.kind === "unit_checkpoint") {
      const result = await this.checkpointResults.findByAttemptId(attemptId);
      return {
        status: attempt.status,
        kind: "unit_checkpoint",
        result: result ? { scorePercent: result.scorePercent, passed: result.passed, skillBreakdown: result.skillBreakdown } : null,
      };
    }

    const result = await this.results.findByAttemptId(attemptId);
    return {
      status: attempt.status,
      kind: "placement",
      result: result ? { skillLevels: result.skillLevels, overallLevel: result.overallLevel } : null,
    };
  }
}
