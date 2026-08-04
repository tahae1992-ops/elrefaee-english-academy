import { getDb } from "@/shared/infrastructure/db/client";
import { refreshTokenRegistry } from "@/modules/identity/infrastructure/db/tables/identity";
import type {
  RecordRefreshTokenInput,
  RefreshTokenRepositoryPort,
} from "@/modules/identity/application/ports/refresh-token-repository-port";

export class DrizzleRefreshTokenAdapter implements RefreshTokenRepositoryPort {
  async record(input: RecordRefreshTokenInput): Promise<void> {
    const tokenHash = await hashToken(input.refreshToken);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + input.expiresInSeconds * 1000);

    await getDb().insert(refreshTokenRegistry).values({
      userId: input.userId,
      tokenHash,
      issuedAt,
      expiresAt,
    });
  }
}

/** DDD §3.1: "token_hash | varchar(128) | UNIQUE, NOT NULL — never store the raw token." */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
