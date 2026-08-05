import { NextResponse } from "next/server";
import { createGetStreakUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";

// API Spec §6.11: GET /gamification/streak — "Current streak state."
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  try {
    const streak = await createGetStreakUseCase().execute(current.userId);
    return NextResponse.json(
      streak ?? { userId: current.userId, currentStreakDays: 0, longestStreakDays: 0, lastActiveDate: null, freezeCredits: 0 },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/v1/gamification/streak failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load streak." }, { status: 500 });
  }
}
