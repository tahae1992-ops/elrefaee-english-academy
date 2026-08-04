export interface CreateUserProfileInput {
  userId: string;
  displayName: string;
  defaultRoleKey: string;
}

export type CefrLevel = "pre_a1" | "a1" | "a2" | "b1" | "b2" | "c1";

export interface UserProfile {
  userId: string;
  displayName: string;
  currentLevel: CefrLevel | null;
}

export interface UserProfileRepositoryPort {
  /**
   * Creates the app-specific profile row for a just-registered Supabase
   * Auth user and grants their default role (DDD §3.1) — both in one
   * atomic operation, since a profile without a role (or vice versa)
   * is an invalid state, not a partial-progress one.
   */
  createProfileWithDefaultRole(input: CreateUserProfileInput): Promise<void>;

  findById(userId: string): Promise<UserProfile | null>;

  /** Placement Test slice — saves the calculated CEFR level to the learner's profile. */
  updateCurrentLevel(userId: string, level: CefrLevel): Promise<void>;
}
