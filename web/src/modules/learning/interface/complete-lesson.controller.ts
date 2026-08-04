import { z } from "zod";
import type { CompleteLessonUseCase } from "@/modules/learning/application/use-cases/complete-lesson.use-case";

const completeLessonSchema = z.object({
  blockIndex: z.number().int().min(0),
  blockInteractions: z.record(z.string(), z.unknown()).default({}),
});

// API Spec §6.3: POST /lessons/{id}/complete (FR-05).
export async function handleCompleteLesson(
  useCase: CompleteLessonUseCase,
  userId: string,
  lessonId: string,
  body: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = completeLessonSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    await useCase.execute({
      userId,
      lessonId,
      position: { blockIndex: parsed.data.blockIndex, blockInteractions: parsed.data.blockInteractions },
    });
    return { status: 200, body: { completed: true } };
  } catch (error) {
    console.error("POST /api/v1/lessons/[id]/complete failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not complete lesson." } };
  }
}
