import { NextResponse } from "next/server";
import { createAdvanceEnrollmentUseCase, createCompleteLessonUseCase, createQueueVocabularyForReviewUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleCompleteLesson } from "@/modules/learning/interface/complete-lesson.controller";

/**
 * API Spec §6.3: POST /lessons/{id}/complete (FR-05). The unit-advance
 * orchestration (does finishing this lesson complete its whole unit,
 * and if so, unlock/point the enrollment at the next one?) lives here
 * — needs both curriculum structure and learning progress, so it's
 * "other code," not either module's own logic, same pattern as the
 * Placement Test finalize route's identity write.
 *
 * Review Engine slice: FR-09's Main Flow step 1 ("lesson completion
 * auto-populates notebook entries") + EDD §5's wrap-up step queueing
 * target vocabulary/grammar chunks into spaced repetition. Also
 * cross-module orchestration for the same reason — `learning`'s
 * QueueVocabularyForReviewUseCase only knows vocabularyEntryIds, and
 * only this route already has the lesson's resolved wrap_up block
 * (via `gate.lesson`, curriculum's output).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const gate = await gateLessonAccess(id, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const body = await request.json();
  const { status, body: responseBody } = await handleCompleteLesson(createCompleteLessonUseCase(), current.userId, id, body);
  if (status !== 200) {
    return NextResponse.json(responseBody, { status });
  }

  const { lesson, snapshot } = gate;

  const wrapUpBlock = lesson.content.blocks.find((block) => block.type === "wrap_up");
  if (wrapUpBlock && wrapUpBlock.type === "wrap_up" && wrapUpBlock.targetVocabulary.length > 0) {
    await createQueueVocabularyForReviewUseCase().execute(
      current.userId,
      wrapUpBlock.targetVocabulary.map((ref) => ref.id),
      new Date(),
    );
  }

  const lessonsInUnit = snapshot.lessonsByUnit.get(lesson.unitId) ?? [];
  const unitNowComplete = lessonsInUnit.every(
    (unitLesson) => unitLesson.id === lesson.id || snapshot.statusByLesson.get(unitLesson.id) === "completed",
  );

  let nextUnitId: string | null = null;
  if (unitNowComplete) {
    const currentUnit = snapshot.courseDetail.units.find((unit) => unit.id === lesson.unitId);
    const nextUnit = currentUnit
      ? snapshot.courseDetail.units.find((unit) => unit.orderIndex === currentUnit.orderIndex + 1)
      : undefined;
    if (nextUnit) {
      await createAdvanceEnrollmentUseCase().execute(current.userId, snapshot.courseDetail.course.academyId, nextUnit.id);
      nextUnitId = nextUnit.id;
    }
  }

  // Automatic lesson progression: the next lesson in this unit, or the
  // first lesson of the newly-unlocked next unit, or null (course done).
  let nextLessonId: string | null = null;
  const lessonsInCurrentUnit = [...lessonsInUnit].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIndex = lessonsInCurrentUnit.findIndex((unitLesson) => unitLesson.id === lesson.id);
  if (currentIndex !== -1 && currentIndex + 1 < lessonsInCurrentUnit.length) {
    nextLessonId = lessonsInCurrentUnit[currentIndex + 1].id;
  } else if (nextUnitId) {
    const lessonsInNextUnit = [...(snapshot.lessonsByUnit.get(nextUnitId) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    nextLessonId = lessonsInNextUnit[0]?.id ?? null;
  }

  return NextResponse.json({ completed: true, unitCompleted: unitNowComplete, nextUnitId, nextLessonId }, { status: 200 });
}
