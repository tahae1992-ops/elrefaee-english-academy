import { NextResponse } from "next/server";
import { createListExercisesForLessonUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleListExercisesForLesson } from "@/modules/curriculum/interface/list-exercises-for-lesson.controller";

// API Spec §6.4: GET /exercises?lessonId= (a filtered top-level collection, per the spec's own naming-convention rule — never a nested /exercises/{lessonId}/... path).
export async function GET(request: Request) {
  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "lessonId query param is required." }, { status: 400 });
  }

  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const gate = await gateLessonAccess(lessonId, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const { status, body } = await handleListExercisesForLesson(createListExercisesForLessonUseCase(), lessonId);
  return NextResponse.json(body, { status });
}
