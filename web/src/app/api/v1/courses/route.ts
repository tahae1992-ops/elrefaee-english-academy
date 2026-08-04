import { NextResponse } from "next/server";
import { createListCoursesUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { handleListCourses } from "@/modules/curriculum/interface/list-courses.controller";

// API Spec §6.3: GET /courses. The learner's CEFR level comes from the
// identity module (interface layer only, per SAD §4) rather than the
// curriculum module reaching across the boundary itself.
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleListCourses(createListCoursesUseCase(), current.dashboardData.currentLevel);
  return NextResponse.json(body, { status });
}
