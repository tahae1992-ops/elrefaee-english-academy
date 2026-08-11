import { NextResponse } from "next/server";
import { createRecordActivityEventUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";

// API Spec §6.3: GET /lessons/{id}. Server-side access gating (SRS
// FR-04's AC) lives in gate-lesson-access.ts, shared with the write
// routes below and the Lesson page.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const result = await gateLessonAccess(id, current.userId, current.dashboardData.currentLevel);
  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  // Phase 21, Goal 2: a real "opened this lesson" signal for the
  // teacher activity timeline — this is the actual route the Lesson
  // page's Server Component fetches through, so it fires exactly when
  // a learner opens (or reopens) the lesson.
  await createRecordActivityEventUseCase().execute({
    userId: current.userId,
    eventType: "lesson_started",
    lessonId: id,
  });

  return NextResponse.json(result.lesson, { status: 200 });
}
