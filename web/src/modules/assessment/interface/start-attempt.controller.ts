import { z } from "zod";
import type { StartPlacementAttemptUseCase } from "@/modules/assessment/application/use-cases/start-placement-attempt.use-case";

const schema = z.object({
  selfAssessedLevel: z.enum(["pre_a1", "a1", "a2", "b1", "b2", "c1"]),
});

export async function handleStartAttempt(
  useCase: StartPlacementAttemptUseCase,
  userId: string,
  rawInput: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = schema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const result = await useCase.execute({ userId, selfAssessedLevel: parsed.data.selfAssessedLevel });
    return { status: 201, body: result };
  } catch (error) {
    console.error("POST /api/v1/assessment-attempts failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not start the placement test." } };
  }
}
