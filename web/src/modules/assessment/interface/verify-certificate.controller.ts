import type { VerifyCertificateUseCase } from "@/modules/assessment/application/use-cases/verify-certificate.use-case";
import { CertificateNotFoundError } from "@/modules/assessment/application/use-cases/verify-certificate.use-case";

/** API Spec §7.4's `GET /certificates/verify/{code}` — public, unauthenticated. Rate limiting is applied by the Route Handler (it needs the request's IP, an HTTP-layer concern this controller deliberately doesn't touch). */
export async function handleVerifyCertificate(useCase: VerifyCertificateUseCase, code: string): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute(code);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof CertificateNotFoundError) {
      return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    }

    console.error("GET /api/v1/certificates/verify/[code] failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not verify this certificate." } };
  }
}
