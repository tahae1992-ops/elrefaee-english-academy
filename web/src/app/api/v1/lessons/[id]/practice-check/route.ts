import { NextResponse } from "next/server";
import { createCheckPracticeAnswerUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleCheckPracticeAnswer } from "@/modules/curriculum/interface/check-practice-answer.controller";

// Not in API Spec §6.3's table (predates this slice's exercise model)
// — see check-practice-answer.controller.ts's header note.
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
  const { status, body: responseBody } = await handleCheckPracticeAnswer(createCheckPracticeAnswerUseCase(), id, body);
  return NextResponse.json(responseBody, { status });
}
