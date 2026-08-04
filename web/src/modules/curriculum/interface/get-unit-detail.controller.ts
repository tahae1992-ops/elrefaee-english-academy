import type { GetUnitDetailUseCase } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
import { UnitNotFoundError } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";

// API Spec §6.3: GET /units/{id}/lessons.
export async function handleGetUnitDetail(
  useCase: GetUnitDetailUseCase,
  unitId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute(unitId);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof UnitNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("GET /api/v1/units/[id]/lessons failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load unit." } };
  }
}
