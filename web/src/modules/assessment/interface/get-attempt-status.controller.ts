import type { GetAttemptStatusUseCase } from "@/modules/assessment/application/use-cases/get-attempt-status.use-case";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";

export async function handleGetAttemptStatus(
  useCase: GetAttemptStatusUseCase,
  userId: string,
  attemptId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute(attemptId, userId);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof AttemptNotOwnedError) return { status: 403, body: { error: "FORBIDDEN", message: error.message } };

    console.error("GET /api/v1/assessment-attempts/[id] failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not fetch attempt status." } };
  }
}
