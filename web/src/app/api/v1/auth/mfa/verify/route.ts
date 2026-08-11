import { NextResponse } from "next/server";
import { createAuthService, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleMfaVerify } from "@/modules/identity/interface/mfa.controller";

// A 6-digit TOTP code is brute-forceable in principle (1e6 space) --
// rate-limited by userId the same way login is rate-limited by
// email/IP (Phase 17 security audit's discipline extended here).
const MFA_VERIFY_LIMIT = 10;
const MFA_VERIFY_WINDOW_MINUTES = 10;

/** Blueprint §15 MFA slice: POST /api/v1/auth/mfa/verify — the shared final step for both enrollment and step-up. On success, the session elevates to aal2 and the response mirrors a plain login success. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const rateLimiter = createDrizzleRateLimiterAdapter();
  const allowed = await rateLimiter.checkAndIncrement(`mfa:verify:${user.id}`, MFA_VERIFY_LIMIT, MFA_VERIFY_WINDOW_MINUTES);
  if (!allowed) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleMfaVerify(createAuthService(), body);
  return NextResponse.json(responseBody, { status });
}
