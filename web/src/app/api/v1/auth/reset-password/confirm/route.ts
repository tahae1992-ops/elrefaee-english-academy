import { NextResponse } from "next/server";
import { createAuthService } from "@/composition-root";

/**
 * The URL Supabase's password-reset email actually links to
 * (`resetPasswordForEmail`'s `redirectTo`, set in
 * request-password-reset.action.ts). A Route Handler, not a page or
 * Server Action, specifically because exchanging the emailed code for
 * a session needs to set cookies on the *response* — a Server
 * Component render can't do that (see server-client.ts's own comment
 * on why), only a Route Handler or another Server Action can. This
 * handler's whole job is to do that exchange once, then redirect into
 * the actual "choose a new password" page (reset-password/page.tsx),
 * which the browser then loads with the new session cookie already
 * attached, no code in the URL at all.
 *
 * No `locale` segment here (API routes live outside `[locale]`) --
 * redirecting to the bare `/reset-password` path is intentional:
 * next-intl's own proxy resolves it to the visitor's actual locale
 * (persisted cookie, then Accept-Language, then the "en" default),
 * exactly like every other unprefixed link in this app.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/forgot-password?error=missing-code", url.origin));
  }

  try {
    await createAuthService().exchangePasswordResetCode(code);
  } catch (error) {
    console.error("GET /api/v1/auth/reset-password/confirm failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.redirect(new URL("/forgot-password?error=expired", url.origin));
  }

  return NextResponse.redirect(new URL("/reset-password", url.origin));
}
