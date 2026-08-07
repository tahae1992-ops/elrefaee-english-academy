import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";
import type { CheckpointResultRepositoryPort } from "@/modules/assessment/application/ports/checkpoint-result-repository-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";
import type { PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { CheckpointScore } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";

export interface CertificationScore extends CheckpointScore {
  pendingReviewCount: number;
}

export interface AttemptStatus {
  status: "in_progress" | "completed" | "abandoned";
  kind: "placement" | "unit_checkpoint" | "certification_exam";
  result: PlacementScore | CheckpointScore | CertificationScore | null;
}

/** API Spec §6.5's `GET /assessment-attempts/{id}` — dispatches to the right result repository by the attempt's own blueprint kind, so one endpoint serves Placement, Unit Checkpoint, and Certification Exam attempts. */
export class GetAttemptStatusUseCase {
  constructor(
    private readonly attempts: AttemptRepositoryPort,
    private readonly itemBank: ItemBankPort,
    private readonly results: ResultRepositoryPort,
    private readonly checkpointResults: CheckpointResultRepositoryPort,
    private readonly certificationResults: CertificationResultRepositoryPort,
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

    if (meta?.kind === "certification_exam") {
      const result = await this.certificationResults.findByAttemptId(attemptId);
      return {
        status: attempt.status,
        kind: "certification_exam",
        result: result
          ? { scorePercent: result.scorePercent, passed: result.passed, skillBreakdown: result.skillBreakdown, pendingReviewCount: result.pendingReviewCount }
          : null,
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
