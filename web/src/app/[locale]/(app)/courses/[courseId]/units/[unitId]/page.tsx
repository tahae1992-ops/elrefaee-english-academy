import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { resolveCourseProgress } from "@/lib/resolve-course-progress";
import { isUnitUnlocked } from "@/lib/lesson-access";
import { CourseNotFoundError } from "@/modules/curriculum/interface/types";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";
import { UnitContent } from "@/components/courses/unit-content";

/** doc 08 §4.9 "Unit" — the unit's ordered lesson list + a visible-but-locked checkpoint placeholder. */
export default async function UnitPage({ params }: { params: Promise<{ courseId: string; unitId: string }> }) {
  const { courseId, unitId } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) return null;

  let snapshot;
  try {
    snapshot = await resolveCourseProgress(courseId, current.userId);
  } catch (error) {
    if (error instanceof CourseNotFoundError) notFound();
    return (
      <div className="p-4 md:p-8">
        <WidgetsErrorState namespace="CourseDetails.error" />
      </div>
    );
  }

  const unit = snapshot.courseDetail.units.find((u) => u.id === unitId);
  if (!unit) notFound();

  // SRS FR-04's AC extended to units: access denied server-side, not just hidden.
  const unlocked = isUnitUnlocked(
    snapshot.courseDetail.course.cefrLevel,
    current.dashboardData.currentLevel,
    snapshot.unitAccess.get(unitId),
  );
  if (!unlocked) {
    redirect(`/courses/${courseId}`);
  }

  const lessons = [...(snapshot.lessonsByUnit.get(unitId) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <UnitContent
      courseId={courseId}
      unit={unit}
      lessons={lessons}
      statusByLesson={snapshot.statusByLesson}
      unitAccess={snapshot.unitAccess.get(unitId) ?? "locked"}
    />
  );
}
