import { z } from "zod";
import type { CheckPracticeAnswerUseCase } from "@/modules/curriculum/application/use-cases/check-practice-answer.use-case";
import { BlockNotFoundError, ExerciseNotFoundError } from "@/modules/curriculum/application/use-cases/check-practice-answer.use-case";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";

const checkPracticeAnswerSchema = z.object({
  blockIndex: z.number().int().min(0),
  exerciseIndex: z.number().int().min(0),
  selectedOptionIndex: z.number().int().min(0),
});

// Not in API Spec §6.3's table (which pre-dates this slice's exercise
// model) — a genuine, disclosed addition, same "no schema existed, one
// was designed for this slice" note as lesson-blocks.ts.
export async function handleCheckPracticeAnswer(
  useCase: CheckPracticeAnswerUseCase,
  lessonId: string,
  body: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = checkPracticeAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const result = await useCase.execute({ lessonId, ...parsed.data });
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof LessonNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof BlockNotFoundError) return { status: 400, body: { error: "VALIDATION_FAILED", message: error.message } };
    if (error instanceof ExerciseNotFoundError) return { status: 400, body: { error: "VALIDATION_FAILED", message: error.message } };

    console.error("POST /api/v1/lessons/[id]/practice-check failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not check answer." } };
  }
}
