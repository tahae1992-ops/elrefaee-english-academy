import type { ListCertificatesUseCase } from "@/modules/assessment/application/use-cases/list-certificates.use-case";

export async function handleListCertificates(useCase: ListCertificatesUseCase, userId: string): Promise<{ status: number; body: unknown }> {
  try {
    const certificates = await useCase.execute(userId);
    return { status: 200, body: { certificates } };
  } catch (error) {
    console.error("GET /api/v1/certificates failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load your certificates." } };
  }
}
