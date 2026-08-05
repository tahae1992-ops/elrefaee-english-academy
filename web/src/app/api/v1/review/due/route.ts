import { NextResponse } from "next/server";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { resolveDueReviewQueue } from "@/lib/resolve-due-review-queue";

const MAX_QUEUE_SIZE = 50;

// API Spec §6.7: GET /review/due — today's due review queue (flashcards).
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  try {
    const queue = await resolveDueReviewQueue(current.userId, new Date(), MAX_QUEUE_SIZE);
    return NextResponse.json(queue, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/review/due failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load the review queue." }, { status: 500 });
  }
}
