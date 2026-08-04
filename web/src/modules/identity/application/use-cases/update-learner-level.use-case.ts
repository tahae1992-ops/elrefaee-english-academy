import type { CefrLevel, UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";

/**
 * Placement Test slice's cross-module save step — the assessment
 * module scores an attempt and returns a CEFR level, but only
 * identity's own layer may write to `identity.user_profiles`
 * (SAD §4's module-boundary rule). The Placement Test's finalize route
 * (Interface layer) calls this after assessment's own
 * FinalizeAttemptUseCase, rather than either module reaching into the
 * other's internals.
 */
export class UpdateLearnerLevelUseCase {
  constructor(private readonly userProfiles: UserProfileRepositoryPort) {}

  async execute(userId: string, level: CefrLevel): Promise<void> {
    await this.userProfiles.updateCurrentLevel(userId, level);
  }
}
