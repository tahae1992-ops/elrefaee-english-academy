"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAuthService, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";
import { getSiteOrigin } from "@/lib/get-site-origin";

// Same rationale and shape as register's IP limit (Phase 17 audit):
// no auth gate exists before a reset email is requested, so this is
// the abuse control — mass-emailing an address, or using response
// timing to enumerate accounts, not a per-account check.
const REQUEST_RESET_IP_LIMIT = 10;
const REQUEST_RESET_RATE_LIMIT_WINDOW_MINUTES = 10;

const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type RequestPasswordResetFieldErrorCode = "invalid";
export type RequestPasswordResetFieldErrors = Partial<Record<"email", RequestPasswordResetFieldErrorCode>>;

export type RequestPasswordResetResult =
  | { status: "success" }
  | { status: "error"; code?: "rateLimited"; fieldErrors?: RequestPasswordResetFieldErrors };

/**
 * Interface layer (SAD §6.1) — a Server Action, matching register's
 * own pattern (no API Spec entry, goes through Supabase Auth via our
 * own AuthService rather than a documented REST endpoint).
 *
 * API Spec §7.1's no-enumeration rule applies here at its strictest:
 * the response is **identical** ("success") whether or not `email`
 * belongs to a real account — Supabase's own resetPasswordForEmail
 * already doesn't leak this, and this Action doesn't add a way to
 * infer it either (no differing error, no differing timing branch).
 */
export async function requestPasswordResetAction(input: unknown): Promise<RequestPasswordResetResult> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const allowed = await createDrizzleRateLimiterAdapter().checkAndIncrement(
    `password-reset:ip:${ip}`,
    REQUEST_RESET_IP_LIMIT,
    REQUEST_RESET_RATE_LIMIT_WINDOW_MINUTES,
  );
  if (!allowed) {
    return { status: "error", code: "rateLimited" };
  }

  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: "invalid" } };
  }

  try {
    const origin = await getSiteOrigin();
    await createAuthService().requestPasswordReset(parsed.data.email, `${origin}/api/v1/auth/reset-password/confirm`);
  } catch (error) {
    // Logged, never surfaced — the response is "success" either way
    // (see the no-enumeration note above), so a real provider failure
    // (rate limit at Supabase's own layer, misconfigured redirect
    // URL) still needs to be visible somewhere.
    console.error("requestPasswordResetAction failed:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof AuthProviderError ? error.code : undefined,
      status: error instanceof AuthProviderError ? error.status : undefined,
      rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
    });
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
  }

  return { status: "success" };
}
