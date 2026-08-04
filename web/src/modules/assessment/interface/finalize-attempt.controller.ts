import type { FinalizeAttemptUseCase } from "@/modules/assessment/application/use-cases/finalize-attempt.use-case";
import type { PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";

export type FinalizeAttemptControllerResult =
  | { status: 200; body: { result: PlacementScore } }
  | { status: 403 | 404 | 409 | 500; body: { error: string; message: string } };

/**
 * Scores the attempt only — saving the resulting level to the
 * learner's profile is identity's own module boundary to write across
 * (SAD §4), so that step is orchestrated by the Route Handler (true
 * "other code," neither module's interior), not from inside this
 * controller.
 */
export async function handleFinalizeAttempt(
  useCase: FinalizeAttemptUseCase,
  userId: string,
  attemptId: string,
): Promise<FinalizeAttemptControllerResult> {
  try {
    const score = await useCase.execute({ attemptId, userId });
    return { status: 200, body: { result: score } };
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof AttemptNotOwnedError) return { status: 403, body: { error: "FORBIDDEN", message: error.message } };
    if (error instanceof AttemptAlreadyCompletedError) return { status: 409, body: { error: "CONFLICT", message: error.message } };

    console.error("POST /api/v1/assessment-attempts/[id]/submit failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not finalize your placement test." } };
  }
}
