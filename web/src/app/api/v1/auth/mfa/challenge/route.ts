import { NextResponse } from "next/server";
import { createAuthService } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleMfaChallenge } from "@/modules/identity/interface/mfa.controller";

/** Blueprint §15 MFA slice: POST /api/v1/auth/mfa/challenge — opens a fresh challenge for an already-enrolled factor (returning-user step-up, or a retry after a wrong/expired code). Same aal1-session requirement as /enroll. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleMfaChallenge(createAuthService(), body);
  return NextResponse.json(responseBody, { status });
}
