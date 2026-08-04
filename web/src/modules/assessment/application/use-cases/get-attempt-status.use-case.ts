import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";
import type { PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";

export interface AttemptStatus {
  status: "in_progress" | "completed" | "abandoned";
  result: PlacementScore | null;
}

/** API Spec §7's `GET /assessment-attempts/{id}`. */
export class GetAttemptStatusUseCase {
  constructor(
    private readonly attempts: AttemptRepositoryPort,
    private readonly results: ResultRepositoryPort,
  ) {}

  async execute(attemptId: string, userId: string): Promise<AttemptStatus> {
    const attempt = await this.attempts.findById(attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== userId) throw new AttemptNotOwnedError();

    const result = await this.results.findByAttemptId(attemptId);
    return {
      status: attempt.status,
      result: result ? { skillLevels: result.skillLevels, overallLevel: result.overallLevel } : null,
    };
  }
}
