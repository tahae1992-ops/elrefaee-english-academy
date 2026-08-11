export interface SignUpResult {
  userId: string;
  /** True when Supabase requires the user to confirm their email before a session exists. */
  emailConfirmationRequired: boolean;
}

export interface SignInResult {
  userId: string;
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires (API Spec §7.1's `expiresIn`). */
  expiresIn: number;
}

export interface MfaFactor {
  id: string;
  status: "verified" | "unverified";
}

export interface MfaEnrollResult {
  factorId: string;
  /** A `data:image/svg+xml` URI Supabase generates directly — usable as an `<img src>` with no extra QR-rendering library. */
  qrCode: string;
  /** The raw TOTP secret, for the "can't scan the code" manual-entry fallback. */
  secret: string;
}

export interface MfaChallengeResult {
  challengeId: string;
}

/**
 * Thrown by AuthProviderPort implementations — carries everything
 * Supabase Auth returned (code/status/raw response), not just a
 * flattened message, so the Interface layer can log and (in dev)
 * surface the real failure instead of a generic one.
 */
export class AuthProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string | undefined,
    public readonly status: number | undefined,
    public readonly rawResponse: unknown,
  ) {
    super(message);
    this.name = "AuthProviderError";
  }
}

/**
 * Application layer port (SAD §6.1) over Supabase Auth — the
 * credential-handling itself is Supabase's scope (Blueprint §00), not
 * ours; this is the narrow seam our own code depends on.
 */
export interface AuthProviderPort {
  signUp(email: string, password: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(): Promise<void>;
  /** Always resolves, regardless of whether `email` belongs to an account — API Spec §7.1's no-enumeration rule applies here too. */
  requestPasswordReset(email: string, redirectTo: string): Promise<void>;
  /** Exchanges the emailed link's one-time `code` for a real (recovery) session, setting session cookies via the caller's Supabase client. Throws if the code is invalid, already used, or expired. Returns the resulting session's user id, for audit logging. */
  exchangeRecoveryCode(code: string): Promise<{ userId: string }>;
  /** Updates the password on the *current* session (the recovery session established by `exchangeRecoveryCode`) — never takes a token as a parameter, matching Supabase's own `updateUser` contract. */
  updatePassword(newPassword: string): Promise<void>;

  /** Blueprint §15's MFA-required-roles flow, step 0: what factors (if any) does the *current* session's user already have. Requires an authenticated (aal1+) session — the password sign-in that preceded this already set one via cookies. */
  listMfaFactors(): Promise<MfaFactor[]>;
  /** Starts TOTP enrollment for the current session's user. Unenrolls any stale unverified TOTP factor first (an abandoned previous attempt), so retrying never piles up orphaned factors. */
  enrollMfaFactor(): Promise<MfaEnrollResult>;
  /** Starts a challenge against an existing factor — used both to confirm a fresh enrollment and to step up an already-enrolled user's session on a later login. */
  createMfaChallenge(factorId: string): Promise<MfaChallengeResult>;
  /** Verifies the 6-digit TOTP code against an open challenge. On success, the session elevates to aal2 (cookies updated as a side effect, same as signIn) and a fresh token pair is returned. */
  verifyMfaChallenge(factorId: string, challengeId: string, code: string): Promise<SignInResult>;
}
