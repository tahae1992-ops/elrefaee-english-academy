import { NextResponse } from "next/server";
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

  return NextResponse.json(result.lesson, { status: 200 });
}
