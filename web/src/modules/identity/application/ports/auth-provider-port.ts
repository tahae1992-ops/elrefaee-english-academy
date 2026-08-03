export interface SignUpResult {
  userId: string;
  /** True when Supabase requires the user to confirm their email before a session exists. */
  emailConfirmationRequired: boolean;
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
}
