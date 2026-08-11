import { z } from "zod";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";
import type { AuthService } from "@/modules/identity/application/use-cases/auth.service";
import type { LoginResponseBody } from "@/modules/identity/interface/login.controller";

export interface MfaEnrollResponseBody {
  factorId: string;
  challengeId: string;
  qrCode: string;
  secret: string;
}

/** Blueprint §15 MFA slice: starts TOTP enrollment for the caller's already-authenticated (aal1) session, then immediately opens the challenge the client's first code entry will answer — one round trip instead of two. */
export async function handleMfaEnroll(
  authService: AuthService,
): Promise<{ status: number; body: MfaEnrollResponseBody | { error: string; message: string } }> {
  try {
    const enrollment = await authService.enrollMfa();
    const challenge = await authService.challengeMfa(enrollment.factorId);
    return {
      status: 200,
      body: { factorId: enrollment.factorId, challengeId: challenge.challengeId, qrCode: enrollment.qrCode, secret: enrollment.secret },
    };
  } catch (error) {
    return mapMfaError(error, "Could not start MFA enrollment.");
  }
}

const challengeSchema = z.object({ factorId: z.string().min(1) });

export interface MfaChallengeResponseBody {
  challengeId: string;
}

/** Opens a fresh challenge against an already-verified factor — the returning-user step-up path, and also used to retry after a wrong code without restarting enrollment. */
export async function handleMfaChallenge(
  authService: AuthService,
  rawInput: unknown,
): Promise<{ status: number; body: MfaChallengeResponseBody | { error: string; message: string } }> {
  const parsed = challengeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const challenge = await authService.challengeMfa(parsed.data.factorId);
    return { status: 200, body: { challengeId: challenge.challengeId } };
  } catch (error) {
    return mapMfaError(error, "Could not start MFA challenge.");
  }
}

const verifySchema = z.object({
  factorId: z.string().min(1),
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "A TOTP code is exactly 6 digits."),
});

/** Final step for both enrollment and step-up: verifies the 6-digit code and, on success, returns the same shape `POST /auth/login` does on a non-MFA success. */
export async function handleMfaVerify(
  authService: AuthService,
  rawInput: unknown,
): Promise<{ status: number; body: LoginResponseBody }> {
  const parsed = verifySchema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Enter the 6-digit code from your authenticator app." } };
  }

  try {
    const result = await authService.verifyMfa(parsed.data.factorId, parsed.data.challengeId, parsed.data.code);
    // verifyMfa's LoginResult is always "success" in practice (a
    // completed challenge can't come back mfa_required), but the
    // return type is shared with login() — narrow rather than assert.
    if (result.status !== "success") {
      return { status: 401, body: { error: "UNAUTHENTICATED", message: "Verification did not complete." } };
    }
    return {
      status: 200,
      body: { accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: result.expiresIn, roles: result.roles },
    };
  } catch (error) {
    const mapped = mapMfaError(error, "Incorrect or expired code.");
    return { status: mapped.status, body: { error: "UNAUTHENTICATED", message: mapped.body.message } };
  }
}

function mapMfaError(error: unknown, fallbackMessage: string): { status: number; body: { error: string; message: string } } {
  if (error instanceof AuthProviderError) {
    // Supabase returns 401/422-ish failures for "no session" and
    // "wrong/expired code" alike — both are safe to surface as their
    // real message here (unlike login, there's no email-enumeration
    // concern once the caller already has an authenticated session).
    return { status: error.status ?? 400, body: { error: "MFA_FAILED", message: error.message || fallbackMessage } };
  }
  console.error("MFA operation failed:", error);
  return { status: 500, body: { error: "INTERNAL", message: fallbackMessage } };
}
