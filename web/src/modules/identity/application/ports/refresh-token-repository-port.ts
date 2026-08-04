export interface RecordRefreshTokenInput {
  userId: string;
  refreshToken: string;
  expiresInSeconds: number;
}

/**
 * DDD §3.1's refresh_token_registry — a server-side mirror of the
 * refresh token Supabase Auth issued (not a self-minted one, SAD §8's
 * AuthService doesn't reimplement JWT signing). Never stores the raw
 * token, only its hash (DDD: "never store the raw token"), so this
 * table is useful for revocation/observability even if compromised.
 */
export interface RefreshTokenRepositoryPort {
  record(input: RecordRefreshTokenInput): Promise<void>;
}
