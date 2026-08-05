import { NextResponse } from "next/server";
import { createGetXpBalanceUseCase, createListRecentXpTransactionsUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { deriveLevel } from "@/modules/engagement/interface/types";

const RECENT_LEDGER_LIMIT = 20;

// API Spec §6.11: GET /gamification/xp — "Current XP balance + recent ledger."
export async function GET() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  try {
    const [totalXp, recentTransactions] = await Promise.all([
      createGetXpBalanceUseCase().execute(current.userId),
      createListRecentXpTransactionsUseCase().execute(current.userId, RECENT_LEDGER_LIMIT),
    ]);

    return NextResponse.json({ totalXp, level: deriveLevel(totalXp), recentTransactions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/gamification/xp failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load XP." }, { status: 500 });
  }
}
