import type { StartCertificationAttemptUseCase } from "@/modules/assessment/application/use-cases/start-certification-attempt.use-case";
import { CertificationBlueprintNotFoundError, CertificationCooldownError } from "@/modules/assessment/application/use-cases/start-certification-attempt.use-case";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export async function handleStartCertificationAttempt(
  useCase: StartCertificationAttemptUseCase,
  userId: string,
  cefrLevel: CefrLevel,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute({ userId, cefrLevel });
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof CertificationBlueprintNotFoundError) {
      return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    }
    if (error instanceof CertificationCooldownError) {
      return { status: 429, body: { error: "COOLDOWN", message: error.message, unlockAt: error.unlockAt.toISOString() } };
    }

    console.error("GET /api/v1/exams/[cefrLevel]/certification failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not start the certification exam." } };
  }
}
