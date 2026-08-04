import { NextResponse } from "next/server";
import { createAuthService } from "@/composition-root";
import { handleLogin } from "@/modules/identity/interface/login.controller";

// API Spec §7.1. Uses the Supabase SSR server client internally (via
// SupabaseAuthAdapter), so a successful login also sets this browser's
// session cookie as a side effect — the same session Dashboard's
// Server Component reads, on top of the token pair this route returns
// per the documented contract.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleLogin(createAuthService(), body);

  return NextResponse.json(responseBody, { status });
}
