import { NextResponse } from "next/server";
import { createAuthService } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleMfaEnroll } from "@/modules/identity/interface/mfa.controller";

/**
 * Blueprint §15 MFA slice: POST /api/v1/auth/mfa/enroll. Requires the
 * aal1 session cookie the preceding `POST /auth/login` already set —
 * this route only starts enrollment for whoever that session belongs
 * to, never accepts an identity as input.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleMfaEnroll(createAuthService());
  return NextResponse.json(body, { status });
}
