import { z } from "zod";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";
import type { AuthService } from "@/modules/identity/application/use-cases/auth.service";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export interface LoginErrorDebugInfo {
  name?: string;
  code?: string;
  status?: number;
  message: string;
  rawResponse?: unknown;
  stack?: string;
}

export type LoginResponseBody =
  | { accessToken: string; refreshToken: string; expiresIn: number; roles: string[] }
  | { error: "VALIDATION_FAILED"; message: string }
  | { error: "UNAUTHENTICATED"; message: string; debug?: LoginErrorDebugInfo }
  | { error: "MFA_NOT_IMPLEMENTED"; message: string };

/**
 * Interface layer for API Spec §7.1 `POST /api/v1/auth/login` — a real
 * REST route (unlike Register, which the spec deliberately omits and
 * routes through Supabase's client directly). Kept separate from the
 * Next.js Route Handler so it's testable without the framework runtime.
 */
export async function handleLogin(
  authService: AuthService,
  rawInput: unknown,
): Promise<{ status: number; body: LoginResponseBody }> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    // API Spec §7.1: "password non-empty (length checked server-side,
    // never revealed in the error to avoid aiding enumeration)" — the
    // client only ever learns "validation failed," not which rule.
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const result = await authService.login(parsed.data);

    if (result.status === "mfa_required") {
      // Detected correctly (role resolution + Blueprint §15's policy
      // both ran for real) but the MFA challenge flow itself isn't
      // built yet — an honest 501, not a fabricated mfaChallengeId
      // the client could never actually complete.
      return {
        status: 501,
        body: { error: "MFA_NOT_IMPLEMENTED", message: "MFA is required for this account but not yet supported." },
      };
    }

    return {
      status: 200,
      body: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        roles: result.roles,
      },
    };
  } catch (error) {
    console.error("POST /api/v1/auth/login failed:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof AuthProviderError ? error.code : undefined,
      status: error instanceof AuthProviderError ? error.status : undefined,
      rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);

    // API Spec §7.1: "generic error message on any credential failure
    // — never reveals whether the email exists." Full detail still
    // surfaced outside production, same pattern as Register.
    const isDev = process.env.NODE_ENV !== "production";
    return {
      status: 401,
      body: {
        error: "UNAUTHENTICATED",
        message: isDev
          ? (error instanceof Error ? error.message : String(error))
          : "Invalid email or password.",
        debug: isDev
          ? {
              name: error instanceof Error ? error.name : undefined,
              code: error instanceof AuthProviderError ? error.code : undefined,
              status: error instanceof AuthProviderError ? error.status : undefined,
              message: error instanceof Error ? error.message : String(error),
              rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
              stack: error instanceof Error ? error.stack : undefined,
            }
          : undefined,
      },
    };
  }
}
