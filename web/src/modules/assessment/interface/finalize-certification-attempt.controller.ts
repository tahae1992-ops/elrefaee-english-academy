import type { FinalizeCertificationAttemptUseCase } from "@/modules/assessment/application/use-cases/finalize-certification-attempt.use-case";
import { CertificationBlueprintNotFoundError } from "@/modules/assessment/application/use-cases/start-certification-attempt.use-case";
import { CertificateTemplateMissingError } from "@/modules/assessment/application/use-cases/issue-certificate.use-case";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";

export async function handleFinalizeCertificationAttempt(
  useCase: FinalizeCertificationAttemptUseCase,
  userId: string,
  attemptId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute({ attemptId, userId });
    return { status: 200, body: { result } };
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof AttemptNotOwnedError) return { status: 403, body: { error: "FORBIDDEN", message: error.message } };
    if (error instanceof AttemptAlreadyCompletedError) return { status: 409, body: { error: "CONFLICT", message: error.message } };
    if (error instanceof CertificationBlueprintNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof CertificateTemplateMissingError) return { status: 500, body: { error: "INTERNAL", message: error.message } };

    console.error("POST /api/v1/assessment-attempts/[id]/submit (certification) failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not finalize your certification exam." } };
  }
}
