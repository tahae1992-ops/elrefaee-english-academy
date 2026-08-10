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
}
