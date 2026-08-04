import type { ListCoursesUseCase } from "@/modules/curriculum/application/use-cases/list-courses.use-case";
import type { CefrLevel } from "@/modules/curriculum/domain/services/compute-course-access";

// API Spec §6.3: GET /courses.
export async function handleListCourses(
  useCase: ListCoursesUseCase,
  learnerLevel: CefrLevel | null,
): Promise<{ status: number; body: unknown }> {
  try {
    const courses = await useCase.execute(learnerLevel);
    return { status: 200, body: { courses } };
  } catch (error) {
    console.error("GET /api/v1/courses failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load courses." } };
  }
}
