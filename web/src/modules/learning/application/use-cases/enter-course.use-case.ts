import type { Enrollment, EnrollmentRepositoryPort } from "@/modules/learning/application/ports/enrollment-repository-port";

export interface EnterCourseInput {
  userId: string;
  academyId: string;
  courseId: string;
}

/**
 * DDD §3.5: "one active placement per academy" (UNIQUE(user_id,
 * academy_id)) — a learner has at most one enrollment row per academy.
 * Opening a course get-or-creates it; opening a *different* course
 * within the same academy switches `current_course_id` and resets
 * `current_unit_id` (a fresh start in the new course), rather than
 * creating a second row.
 */
export class EnterCourseUseCase {
  constructor(private readonly enrollments: EnrollmentRepositoryPort) {}

  async execute(input: EnterCourseInput): Promise<Enrollment> {
    const existing = await this.enrollments.findByUserAndAcademy(input.userId, input.academyId);

    if (!existing) {
      return this.enrollments.create({
        userId: input.userId,
        academyId: input.academyId,
        currentCourseId: input.courseId,
        placementMethod: "manual",
      });
    }

    if (existing.currentCourseId !== input.courseId) {
      await this.enrollments.updateCurrentCourse(existing.id, input.courseId);
      return { ...existing, currentCourseId: input.courseId, currentUnitId: null };
    }

    return existing;
  }
}
