import { NextResponse } from "next/server";
import { createSubmitFeedbackUseCase, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleSubmitFeedback } from "@/modules/feedback/interface/submit-feedback.controller";

// Per-user, not per-IP (unlike register/login's pre-auth rate limits):
// the abuse case here is a signed-in learner spamming the form, not
// account enumeration.
const FEEDBACK_USER_LIMIT = 5;
const FEEDBACK_RATE_LIMIT_WINDOW_MINUTES = 10;

/** Phase 19 (Beta Release) — "feedback instrumentation." No API Spec entry (added after that document's baseline); follows the same envelope/auth conventions as every other authenticated route. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const allowed = await createDrizzleRateLimiterAdapter().checkAndIncrement(
    `feedback:user:${user.id}`,
    FEEDBACK_USER_LIMIT,
    FEEDBACK_RATE_LIMIT_WINDOW_MINUTES,
  );
  if (!allowed) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "Too many submissions — try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleSubmitFeedback(createSubmitFeedbackUseCase(), user.id, body);
  return NextResponse.json(responseBody, { status });
}
