import type { AuthProviderPort } from "@/modules/identity/application/ports/auth-provider-port";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResult {
  userId: string;
  emailConfirmationRequired: boolean;
}

/**
 * SAD §8's AuthService — grows one method per Sprint 2 auth slice
 * (register now; login/refresh/logout follow as their own slices).
 * Orchestrates Supabase Auth (credential handling, out of our scope)
 * with our own app-specific provisioning (profile + default role,
 * DDD §3.1) — the two things that must both succeed for "an account
 * exists" to be true.
 */
export class AuthService {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly userProfiles: UserProfileRepositoryPort,
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
}
