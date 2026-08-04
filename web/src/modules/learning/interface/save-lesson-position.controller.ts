import { z } from "zod";
import type { SaveLessonPositionUseCase } from "@/modules/learning/application/use-cases/save-lesson-position.use-case";

const savePositionSchema = z.object({
  blockIndex: z.number().int().min(0),
  blockInteractions: z.record(z.string(), z.unknown()).default({}),
});

// Not in API Spec §6.3/§6.10's tables — a disclosed addition needed
// for FR-05's "system persists exact block/exercise position" rule,
// same rationale as check-practice-answer.controller.ts.
export async function handleSaveLessonPosition(
  useCase: SaveLessonPositionUseCase,
  userId: string,
  lessonId: string,
  body: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = savePositionSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    await useCase.execute({
      userId,
      lessonId,
      position: { blockIndex: parsed.data.blockIndex, blockInteractions: parsed.data.blockInteractions },
    });
    return { status: 200, body: { saved: true } };
  } catch (error) {
    console.error("POST /api/v1/lessons/[id]/progress failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not save progress." } };
  }
}
