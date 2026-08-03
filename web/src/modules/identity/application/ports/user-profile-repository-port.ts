export interface CreateUserProfileInput {
  userId: string;
  displayName: string;
  defaultRoleKey: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
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
}
