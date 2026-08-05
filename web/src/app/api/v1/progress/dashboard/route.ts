import { NextResponse } from "next/server";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { resolveGamificationSnapshot } from "@/lib/resolve-gamification-snapshot";

// API Spec §6.10: GET /progress/dashboard — the dashboard aggregate (see resolve-gamification-snapshot.ts for the disclosed live-vs-precomputed simplification).
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  try {
    const snapshot = await resolveGamificationSnapshot(current.userId, new Date());
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/progress/dashboard failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load dashboard progress." }, { status: 500 });
  }
}
