import { NextResponse } from "next/server";
import { createSubmitReviewResponseUseCase, createAwardXpUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { handleSubmitReviewResponse } from "@/modules/learning/interface/submit-review-response.controller";
import { XP_REWARDS } from "@/modules/engagement/interface/types";
import { recordGamificationActivity } from "@/lib/record-gamification-activity";

/**
 * API Spec §6.7: POST /review/responses. XP awarding is cross-module
 * (`engagement`) and deliberately not inside SubmitReviewResponseUseCase
 * (`learning`) — same boundary rule as every other cross-module side
 * effect in this codebase (Route Handlers/shared lib only). Only a
 * genuinely new, non-"again" response earns XP: `isNewEvent` guards
 * against double-awarding a replayed submission, and "again" (a lapse)
 * is not a "successful review" by this slice's own requirement wording.
 */
export async function POST(request: Request) {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const now = new Date();
  const { status, body: responseBody, result, rating } = await handleSubmitReviewResponse(
    createSubmitReviewResponseUseCase(),
    current.userId,
    await request.json().catch(() => null),
    now,
  );
  if (status !== 200 || !result) {
    return NextResponse.json(responseBody, { status });
  }

  let xpAwarded = 0;
  if (result.isNewEvent && rating !== "again" && result.state.lastEventId) {
    const award = await createAwardXpUseCase().execute({
      userId: current.userId,
      amount: XP_REWARDS.successfulReview,
      sourceEventId: result.state.lastEventId,
      reason: "successfulReview",
    });
    if (award.applied) xpAwarded = XP_REWARDS.successfulReview;
  }

  // Gamification Engine slice: every review response (any rating) counts as today's activity.
  const { newlyAwardedBadges } = await recordGamificationActivity(current.userId, now);

  return NextResponse.json({ ...result.state, xpAwarded, newlyAwardedBadges }, { status: 200 });
}
