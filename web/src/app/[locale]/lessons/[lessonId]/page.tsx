import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetLessonProgressUseCase } from "@/composition-root";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { buildTutorLessonContext } from "@/lib/build-tutor-lesson-context";
import { deriveTutorStarters } from "@/modules/ai/interface/types";
import { LessonFlow } from "./lesson-flow";

/**
 * doc 08 §3.6 / doc 09 §5.5 "Lesson View" — full-focus, no app chrome
 * (outside the (app) route group, same reasoning as Placement Test).
 * Access is re-checked server-side here even though the Unit/Course
 * pages already gate navigation to this URL — SRS FR-04's AC requires
 * denial on direct navigation too, not just hidden links.
 */
export default async function LessonPage({ params }: { params: Promise<{ lessonId: string; locale: string }> }) {
  const { lessonId, locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  const gate = await gateLessonAccess(lessonId, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    redirect({ href: "/courses", locale });
    return;
  }

  const progress = await createGetLessonProgressUseCase().execute(current.userId, [lessonId]);
  const savedPosition = progress.get(lessonId)?.lastPosition ?? { blockIndex: 0, blockInteractions: {} };
  const alreadyCompleted = progress.get(lessonId)?.status === "completed";

  const unit = gate.snapshot.courseDetail.units.find((u) => u.id === gate.lesson.unitId);
  const tutorContext = await buildTutorLessonContext(current.userId, gate.lesson, current.dashboardData.currentLevel);

  return (
    <LessonFlow
      lesson={gate.lesson}
      courseId={gate.snapshot.courseDetail.course.id}
      initialBlockIndex={alreadyCompleted ? 0 : savedPosition.blockIndex}
      initialBlockInteractions={savedPosition.blockInteractions}
      tutorUnitOrderIndex={unit?.orderIndex ?? null}
      tutorStarters={deriveTutorStarters(tutorContext)}
    />
  );
}
