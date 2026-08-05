"use server";

import { z } from "zod";
import { createAuthService } from "@/composition-root";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  // Length only, deliberately no composition rules (no forced mixed
  // case/symbols) — WCAG 2.2 Accessible Authentication (SRS §12.1)
  // steers away from arbitrary complexity requirements.
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(60),
});

/**
 * Semantic codes, not display text — this Server Action has no
 * request-scoped locale context of its own to translate into (same
 * "API/action layer is locale-agnostic" boundary as the REST API, SAD §5
 * addendum), so the client (RegisterForm) maps each code to a translated
 * message via next-intl instead of displaying server-authored English.
 */
export type RegisterFieldErrorCode = "required" | "invalid" | "tooShort";
export type RegisterFieldErrors = Partial<Record<"email" | "password" | "displayName", RegisterFieldErrorCode>>;

/**
 * Full failure detail (code/status/raw response/stack) — populated
 * only outside production (see registerAction below). Never sent to a
 * real client build; this is a debugging aid for local/dev work only.
 */
export interface RegisterErrorDebugInfo {
  name?: string;
  code?: string;
  status?: number;
  message: string;
  rawResponse?: unknown;
  stack?: string;
}

export type RegisterActionResult =
  | { status: "success"; emailConfirmationRequired: boolean }
  | { status: "error"; fieldErrors?: RegisterFieldErrors; message?: string; debug?: RegisterErrorDebugInfo };

/**
 * Interface layer (SAD §6.1) — a Server Action instead of a REST route:
 * the API Spec (§6.1) deliberately has no `/auth/register` endpoint,
 * since registration goes through Supabase Auth's own client directly
 * (Blueprint §00's "removes this from our scope"). Re-validates with
 * the same Zod schema server-side regardless of the client-side
 * react-hook-form validation — never trust client validation alone.
 */
export async function registerAction(input: unknown): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: RegisterFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email") fieldErrors.email = "invalid";
      else if (field === "password") fieldErrors.password = "tooShort";
      else if (field === "displayName") fieldErrors.displayName = "required";
    }
    return { status: "error", fieldErrors };
  }

  try {
    const result = await createAuthService().register(parsed.data);
    return { status: "success", emailConfirmationRequired: result.emailConfirmationRequired };
  } catch (error) {
    // Full detail always logged server-side (and to Sentry once a DSN
    // is configured) — never silently swallowed.
    console.error("registerAction failed:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof AuthProviderError ? error.code : undefined,
      status: error instanceof AuthProviderError ? error.status : undefined,
      rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);

    // Outside production, surface the real failure — don't guess at
    // root causes from a generic message while debugging. In
    // production this still collapses to a generic message (API
    // Spec §7.1's no-enumeration rule for auth errors).
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        debug: {
          name: error instanceof Error ? error.name : undefined,
          code: error instanceof AuthProviderError ? error.code : undefined,
          status: error instanceof AuthProviderError ? error.status : undefined,
          message: error instanceof Error ? error.message : String(error),
          rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
          stack: error instanceof Error ? error.stack : undefined,
        },
      };
    }
    // No `message` here (unlike the dev branch above): this Server
    // Action has no locale context to translate into, so the client
    // (RegisterForm) falls back to its own translated genericError
    // instead of displaying server-authored English.
    return { status: "error" };
  }
}
