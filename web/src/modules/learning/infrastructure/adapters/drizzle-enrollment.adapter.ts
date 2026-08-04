import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { enrollments } from "@/modules/learning/infrastructure/db/tables/learning";
import type { Enrollment, EnrollmentRepositoryPort } from "@/modules/learning/application/ports/enrollment-repository-port";

function toEnrollment(row: typeof enrollments.$inferSelect): Enrollment {
  return {
    id: row.id,
    userId: row.userId,
    academyId: row.academyId,
    currentCourseId: row.currentCourseId,
    currentUnitId: row.currentUnitId,
  };
}

export class DrizzleEnrollmentAdapter implements EnrollmentRepositoryPort {
  async findByUserAndAcademy(userId: string, academyId: string): Promise<Enrollment | null> {
    const [row] = await getDb()
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.academyId, academyId)))
      .limit(1);

    return row ? toEnrollment(row) : null;
  }

  async create(input: {
    userId: string;
    academyId: string;
    currentCourseId: string;
    placementMethod: "self_assessment" | "adaptive_test" | "manual";
  }): Promise<Enrollment> {
    const [row] = await getDb()
      .insert(enrollments)
      .values({
        userId: input.userId,
        academyId: input.academyId,
        currentCourseId: input.currentCourseId,
        placementMethod: input.placementMethod,
      })
      .returning();

    return toEnrollment(row);
  }

  async updateCurrentCourse(enrollmentId: string, courseId: string): Promise<void> {
    await getDb()
      .update(enrollments)
      .set({ currentCourseId: courseId, currentUnitId: null })
      .where(eq(enrollments.id, enrollmentId));
  }

  async updateCurrentUnit(enrollmentId: string, unitId: string): Promise<void> {
    await getDb().update(enrollments).set({ currentUnitId: unitId }).where(eq(enrollments.id, enrollmentId));
  }
}
