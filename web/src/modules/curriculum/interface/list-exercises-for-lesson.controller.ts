import type { ListExercisesForLessonUseCase } from "@/modules/curriculum/application/use-cases/list-exercises-for-lesson.use-case";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";

// API Spec §6.4: GET /exercises?lessonId=.
export async function handleListExercisesForLesson(
  useCase: ListExercisesForLessonUseCase,
  lessonId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const exercises = await useCase.execute(lessonId);
    return { status: 200, body: { exercises } };
  } catch (error) {
    if (error instanceof LessonNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("GET /api/v1/exercises failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load exercises." } };
  }
}
