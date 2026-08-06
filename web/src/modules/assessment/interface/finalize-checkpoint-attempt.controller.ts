import type { FinalizeCheckpointAttemptUseCase } from "@/modules/assessment/application/use-cases/finalize-checkpoint-attempt.use-case";
import type { CheckpointScore } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import { CheckpointBlueprintNotFoundError } from "@/modules/assessment/application/use-cases/start-checkpoint-attempt.use-case";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";

export type FinalizeCheckpointAttemptControllerResult =
  | { status: 200; body: { result: CheckpointScore & { unitId: string } } }
  | { status: 403 | 404 | 409 | 500; body: { error: string; message: string } };

export async function handleFinalizeCheckpointAttempt(
  useCase: FinalizeCheckpointAttemptUseCase,
  userId: string,
  attemptId: string,
): Promise<FinalizeCheckpointAttemptControllerResult> {
  try {
    const score = await useCase.execute({ attemptId, userId });
    return { status: 200, body: { result: score } };
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof AttemptNotOwnedError) return { status: 403, body: { error: "FORBIDDEN", message: error.message } };
    if (error instanceof AttemptAlreadyCompletedError) return { status: 409, body: { error: "CONFLICT", message: error.message } };
    if (error instanceof CheckpointBlueprintNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("POST /api/v1/assessment-attempts/[id]/submit (checkpoint) failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not finalize your checkpoint quiz." } };
  }
}
