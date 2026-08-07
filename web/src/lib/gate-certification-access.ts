import { resolveCourseProgress } from "@/lib/resolve-course-progress";

export type CertificationAccessResult = { ok: true } | { ok: false; status: number; body: unknown };

/**
 * The certification exam's entry gate: EDD §14's rule that the
 * level-end summative assessment is "the same bar" as completing the
 * level — every unit in the course must be fully completed (all
 * lessons done AND that unit's checkpoint passed), reusing the exact
 * same unitAccess computation the Course Details/Unit pages already
 * derive, rather than a second, differently-shaped completeness
 * check.
 */
export async function gateCertificationAccess(courseId: string, userId: string): Promise<CertificationAccessResult> {
  let snapshot;
  try {
    snapshot = await resolveCourseProgress(courseId, userId);
  } catch {
    return { ok: false, status: 404, body: { error: "NOT_FOUND", message: "Course not found." } };
  }

  const allUnitsCompleted = snapshot.courseDetail.units.every((unit) => snapshot.unitAccess.get(unit.id) === "completed");
  if (!allUnitsCompleted) {
    return {
      ok: false,
      status: 403,
      body: { error: "FORBIDDEN", message: "Complete every unit in this course before attempting the certification exam." },
    };
  }

  return { ok: true };
}
