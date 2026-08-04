import { scorePlacementAttempt, type PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";

export interface FinalizeAttemptInput {
  attemptId: string;
  userId: string;
}

/** API Spec §7's `POST /assessment-attempts/{id}/submit` → `score(attempt)` → immutable AssessmentResult. */
export class FinalizeAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly results: ResultRepositoryPort,
  ) {}

  async execute(input: FinalizeAttemptInput): Promise<PlacementScore> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== input.userId) throw new AttemptNotOwnedError();
    if (attempt.status !== "in_progress") throw new AttemptAlreadyCompletedError();

    const responses = await this.attempts.getResponses(input.attemptId);
    const gradedResponses = responses.filter((response) => response.isCorrect !== null);

    // One round trip per item, in parallel — a 24-item attempt run
    // sequentially here previously meant 24 chained DB round trips
    // (tens of seconds); Promise.all collapses it to the cost of one.
    const itemMetas = await Promise.all(
      gradedResponses.map((response) => this.itemBank.getItemForScoring(response.itemId)),
    );

    const graded = [];
    for (let i = 0; i < gradedResponses.length; i++) {
      const meta = itemMetas[i];
      if (!meta) continue;
      graded.push({ skill: meta.skill, cefrLevel: meta.cefrLevel, isCorrect: gradedResponses[i].isCorrect as boolean });
    }

    const score = scorePlacementAttempt(graded);

    await this.results.save({
      attemptId: input.attemptId,
      userId: input.userId,
      skillLevels: score.skillLevels,
      overallLevel: score.overallLevel,
    });
    await this.attempts.markCompleted(input.attemptId);

    return score;
  }
}
