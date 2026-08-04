import type { GetCourseDetailUseCase } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
import { CourseNotFoundError } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";

// API Spec §6.3: GET /courses/{id}/units.
export async function handleGetCourseDetail(
  useCase: GetCourseDetailUseCase,
  courseId: string,
): Promise<{ status: number; body: unknown }> {
  try {
    const result = await useCase.execute(courseId);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof CourseNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("GET /api/v1/courses/[id]/units failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load course." } };
  }
}
