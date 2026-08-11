import { requiresMfa } from "@/modules/identity/domain/services/mfa-policy";
import type { AuthProviderPort, MfaEnrollResult } from "@/modules/identity/application/ports/auth-provider-port";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";
import type { AuditLogPort } from "@/shared/application/ports/audit-log-port";
import type { RefreshTokenRepositoryPort } from "@/modules/identity/application/ports/refresh-token-repository-port";

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResult {
  userId: string;
  emailConfirmationRequired: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResult =
  | { status: "success"; accessToken: string; refreshToken: string; expiresIn: number; roles: string[] }
  /** No verified TOTP factor yet — the client must walk the enrollment flow (enrollMfa → verifyMfa) before it can get a session. */
  | { status: "mfa_enrollment_required" }
  /** A verified TOTP factor already exists — the client only needs a fresh challenge + code (challengeMfa → verifyMfa). */
  | { status: "mfa_challenge_required"; factorId: string };

/**
 * SAD §8's AuthService — grows one method per Sprint 2 auth slice
 * (register, then login; refresh/logout follow as their own slices).
 * Orchestrates Supabase Auth (credential handling, out of our scope)
 * with our own app-specific provisioning (profile + default role,
 * DDD §3.1) — the two things that must both succeed for "an account
 * exists" to be true.
 */
export class AuthService {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly userProfiles: UserProfileRepositoryPort,
    private readonly roleRepository: RoleRepositoryPort,
    private readonly auditLog: AuditLogPort,
    private readonly refreshTokens: RefreshTokenRepositoryPort,
  ) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    const signUpResult = await this.authProvider.signUp(input.email, input.password);

    await this.userProfiles.createProfileWithDefaultRole({
      userId: signUpResult.userId,
      displayName: input.displayName,
      defaultRoleKey: "student",
    });

    return {
      userId: signUpResult.userId,
      emailConfirmationRequired: signUpResult.emailConfirmationRequired,
    };
  }

  /**
   * API Spec §7.1. `signIn` already sets an aal1 session cookie as a
   * side effect (SupabaseAuthAdapter's own doc comment) — that's what
   * lets the MFA branches below call back into `listMfaFactors`/
   * `enrollMfa`/etc. on later requests without re-sending credentials.
   */
  async login(input: LoginInput): Promise<LoginResult> {
    let signInResult;
    try {
      signInResult = await this.authProvider.signIn(input.email, input.password);
    } catch (error) {
      await this.auditLog.record({
        actorId: null,
        action: "auth.login.failure",
        entityType: "user",
        entityId: "00000000-0000-0000-0000-000000000000",
        after: { emailHash: await hashEmail(input.email) },
      });
      throw error;
    }

    const assignments = await this.roleRepository.getRoleAssignmentsForUser(signInResult.userId);
    const roleKeys = assignments.map((assignment) => assignment.roleKey);

    await this.auditLog.record({
      actorId: signInResult.userId,
      action: "auth.login.success",
      entityType: "user",
      entityId: signInResult.userId,
    });

    if (requiresMfa(roleKeys)) {
      const factors = await this.authProvider.listMfaFactors();
      const verifiedFactor = factors.find((factor) => factor.status === "verified");
      return verifiedFactor
        ? { status: "mfa_challenge_required", factorId: verifiedFactor.id }
        : { status: "mfa_enrollment_required" };
    }

    await this.refreshTokens.record({
      userId: signInResult.userId,
      refreshToken: signInResult.refreshToken,
      expiresInSeconds: signInResult.expiresIn,
    });

    return {
      status: "success",
      accessToken: signInResult.accessToken,
      refreshToken: signInResult.refreshToken,
      expiresIn: signInResult.expiresIn,
      roles: roleKeys,
    };
  }

  /** Blueprint §15 MFA slice, enrollment step 1: generates a fresh TOTP secret + QR code for the current (aal1) session's user. */
  async enrollMfa(): Promise<MfaEnrollResult> {
    return this.authProvider.enrollMfaFactor();
  }

  /** Step 2 of both the enrollment and the returning-user flows: opens a challenge the client must then answer with a 6-digit code. */
  async challengeMfa(factorId: string): Promise<{ challengeId: string }> {
    return this.authProvider.createMfaChallenge(factorId);
  }

  /**
   * Final step for both flows: verifies the code, elevates the session
   * to aal2, and returns the same success shape `login()` does so the
   * Route Handler doesn't need two different response builders.
   */
  async verifyMfa(factorId: string, challengeId: string, code: string): Promise<LoginResult> {
    const result = await this.authProvider.verifyMfaChallenge(factorId, challengeId, code);

    const assignments = await this.roleRepository.getRoleAssignmentsForUser(result.userId);
    const roleKeys = assignments.map((assignment) => assignment.roleKey);

    await this.auditLog.record({
      actorId: result.userId,
      action: "auth.mfa.verified",
      entityType: "user",
      entityId: result.userId,
    });

    await this.refreshTokens.record({
      userId: result.userId,
      refreshToken: result.refreshToken,
      expiresInSeconds: result.expiresIn,
    });

    return {
      status: "success",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      roles: roleKeys,
    };
  }

  /** API Spec §6.1's `/auth/logout` — revokes the current session. */
  async logout(userId: string): Promise<void> {
    await this.authProvider.signOut();
    await this.auditLog.record({
      actorId: userId,
      action: "auth.logout",
      entityType: "user",
      entityId: userId,
    });
  }

  /**
   * Password reset, request half. Same no-enumeration contract as
   * login (§7.1) — the caller gets the same "check your email"
   * outcome whether or not the address has an account; only a real
   * provider failure (rate limit, malformed input) throws.
   */
  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    await this.authProvider.requestPasswordReset(email, redirectTo);
    await this.auditLog.record({
      actorId: null,
      action: "auth.password_reset.requested",
      entityType: "user",
      entityId: "00000000-0000-0000-0000-000000000000",
      after: { emailHash: await hashEmail(email) },
    });
  }

  /**
   * Password reset, step 2 of 3: the Route Handler the emailed link
   * points at calls this with the link's one-time `code`, exchanging
   * it for a real recovery session (session cookies get set on the
   * response the Route Handler sends back — a plain Server Action or
   * Server Component render can't do that, only a Route Handler or
   * another Server Action can). The returned userId is only for
   * logging; nothing downstream trusts a caller-supplied one.
   */
  async exchangePasswordResetCode(code: string): Promise<{ userId: string }> {
    const { userId } = await this.authProvider.exchangeRecoveryCode(code);
    await this.auditLog.record({
      actorId: userId,
      action: "auth.password_reset.link_opened",
      entityType: "user",
      entityId: userId,
    });
    return { userId };
  }

  /**
   * Password reset, step 3 of 3: the reset-password form's own Server
   * Action calls this once the recovery session from step 2 is
   * already active (read via cookies, same as every other
   * authenticated action in this app) — it does not re-exchange a
   * code or accept one.
   */
  async updatePasswordForCurrentSession(userId: string, newPassword: string): Promise<void> {
    await this.authProvider.updatePassword(newPassword);
    await this.auditLog.record({
      actorId: userId,
      action: "auth.password_reset.completed",
      entityType: "user",
      entityId: userId,
    });
  }
}

/**
 * API Spec §7.1: "the attempted email hashed, not stored raw, in the
 * log payload." SHA-256 via Web Crypto (`crypto.subtle`, available in
 * both the Node and Edge runtimes Next.js may run this in) — one-way,
 * sufficient for this audit-trail purpose (detecting repeated-target
 * patterns, never for reversing to the original email).
 */
async function hashEmail(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
