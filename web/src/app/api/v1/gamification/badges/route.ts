import { NextResponse } from "next/server";
import { createListBadgesUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";

// API Spec §6.11: GET /gamification/badges — "Earned + available badges."
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  try {
    const badges = await createListBadgesUseCase().execute(current.userId);
    return NextResponse.json({ badges }, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/gamification/badges failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load badges." }, { status: 500 });
  }
}
