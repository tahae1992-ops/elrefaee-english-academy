import { NextResponse } from "next/server";
import { createSaveLessonPositionUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleSaveLessonPosition } from "@/modules/learning/interface/save-lesson-position.controller";

// FR-05's Alternative Flow: persist exact block position on exit/navigation.
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

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleSaveLessonPosition(createSaveLessonPositionUseCase(), current.userId, id, body);
  return NextResponse.json(responseBody, { status });
}
