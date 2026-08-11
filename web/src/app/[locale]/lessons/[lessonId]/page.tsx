import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetLessonProgressUseCase, createRecordActivityEventUseCase } from "@/composition-root";
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

  // Phase 21, Goal 2: real "opened this lesson" signal for the
  // teacher activity timeline — this is the actual code path a
  // browser hits opening/reopening a lesson (the API route of the
  // same name exists for external consumers per API Spec §6.3, but
  // the UI itself renders via this Server Component directly).
  await createRecordActivityEventUseCase().execute({
    userId: current.userId,
    eventType: "lesson_started",
    lessonId,
  });

  const progress = await createGetLessonProgressUseCase().execute(current.userId, [lessonId]);
  const savedPosition = progress.get(lessonId)?.lastPosition ?? { blockIndex: 0, blockInteractions: {} };

  // Pre-A1 blueprint (Rev. 3) Rule 6: the /progress route already
  // records section_viewed for every block a learner advances *into*
  // — block 0 is the one block that's never advanced into (it's just
  // rendered on load), so it needs its own event here or
  // computeLessonCompletionGaps would wrongly treat it as unseen on a
  // single-block lesson, or any lesson completed by navigating
  // straight back to block 0. Only fires the first time block 0 is
  // actually reached (savedPosition.blockIndex === 0 means either a
  // fresh start or a learner who genuinely returned to the first block).
  if (savedPosition.blockIndex === 0) {
    await createRecordActivityEventUseCase().execute({
      userId: current.userId,
      eventType: "section_viewed",
      lessonId,
      metadata: { blockIndex: 0, blockType: gate.lesson.content.blocks[0]?.type },
    });
  }
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
