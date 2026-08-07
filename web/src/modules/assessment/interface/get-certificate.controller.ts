import type { GetCertificateUseCase } from "@/modules/assessment/application/use-cases/get-certificate.use-case";
import { CertificateNotFoundOrNotOwnedError } from "@/modules/assessment/application/use-cases/get-certificate.use-case";

export async function handleGetCertificate(useCase: GetCertificateUseCase, userId: string, id: string): Promise<{ status: number; body: unknown }> {
  try {
    const certificate = await useCase.execute(id, userId);
    return { status: 200, body: { certificate } };
  } catch (error) {
    if (error instanceof CertificateNotFoundOrNotOwnedError) {
      return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    }

    console.error("GET /api/v1/certificates/[id] failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load this certificate." } };
  }
}
