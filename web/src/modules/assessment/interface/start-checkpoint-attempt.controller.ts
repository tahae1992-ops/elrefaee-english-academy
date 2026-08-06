import type { StartCheckpointAttemptUseCase } from "@/modules/assessment/application/use-cases/start-checkpoint-attempt.use-case";
import { CheckpointBlueprintNotFoundError } from "@/modules/assessment/application/use-cases/start-checkpoint-attempt.use-case";

export async function handleStartCheckpointAttempt(
  useCase: StartCheckpointAttemptUseCase,
  userId: string,
  unitId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute({ userId, unitId });
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof CheckpointBlueprintNotFoundError) {
      return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    }

    console.error("GET /api/v1/quizzes/[unitId]/checkpoint failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not start the unit checkpoint." } };
  }
}
