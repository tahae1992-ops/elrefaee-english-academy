import { NextResponse } from "next/server";
import { createAdvanceEnrollmentUseCase, createCompleteLessonUseCase } from "@/composition-root";
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

  return NextResponse.json({ completed: true, unitCompleted: unitNowComplete, nextUnitId }, { status: 200 });
}
