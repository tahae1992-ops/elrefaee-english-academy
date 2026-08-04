import { requiresMfa } from "@/modules/identity/domain/services/mfa-policy";
import type { AuthProviderPort } from "@/modules/identity/application/ports/auth-provider-port";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";
import type { AuditLogPort } from "@/modules/identity/application/ports/audit-log-port";
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
  | { status: "mfa_required" };

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
   * API Spec §7.1. The MFA-required branch is detected correctly
   * (role resolution + Blueprint §15's policy both run for real) but
   * doesn't complete the challenge flow yet — that's the dedicated MFA
   * slice (TOTP setup + challenge screen), not silently faked here
   * with a non-functional `mfaChallengeId`.
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
      return { status: "mfa_required" };
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
