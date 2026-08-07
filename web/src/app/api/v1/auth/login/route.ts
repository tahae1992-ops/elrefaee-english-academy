import { NextResponse } from "next/server";
import { createAuthService, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { handleLogin } from "@/modules/identity/interface/login.controller";

// Phase 17 security audit: login has no auth gate to lean on (it IS
// the gate), so it's rate-limited the same way the public certificate
// verification endpoint is -- by IP (spray-across-many-accounts
// protection) AND by the attempted email (focused brute-force
// protection on one account), matching API Spec §7.1's "generic
// error, never reveals whether the email exists" discipline: a
// rate-limit hit returns the same shape of response either way.
const LOGIN_IP_LIMIT = 20;
const LOGIN_EMAIL_LIMIT = 5;
const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 10;

function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

// API Spec §7.1. Uses the Supabase SSR server client internally (via
// SupabaseAuthAdapter), so a successful login also sets this browser's
// session cookie as a side effect — the same session Dashboard's
// Server Component reads, on top of the token pair this route returns
// per the documented contract.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ip = extractClientIp(request);
  const rateLimiter = createDrizzleRateLimiterAdapter();

  const ipAllowed = await rateLimiter.checkAndIncrement(`login:ip:${ip}`, LOGIN_IP_LIMIT, LOGIN_RATE_LIMIT_WINDOW_MINUTES);
  const email = body && typeof body === "object" && "email" in body && typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const emailAllowed = email ? await rateLimiter.checkAndIncrement(`login:email:${email}`, LOGIN_EMAIL_LIMIT, LOGIN_RATE_LIMIT_WINDOW_MINUTES) : true;

  if (!ipAllowed || !emailAllowed) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "Too many login attempts. Try again shortly." }, { status: 429 });
  }

  const { status, body: responseBody } = await handleLogin(createAuthService(), body);

  return NextResponse.json(responseBody, { status });
}
