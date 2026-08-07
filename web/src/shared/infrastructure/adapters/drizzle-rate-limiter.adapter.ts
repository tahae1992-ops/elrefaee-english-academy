import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { rateLimitBuckets } from "@/shared/infrastructure/db/tables/rate-limit";
import { decideRateLimit } from "@/shared/domain/services/rate-limit-window";
import type { RateLimiterPort } from "@/shared/application/ports/rate-limiter-port";

export class DrizzleRateLimiterAdapter implements RateLimiterPort {
  async checkAndIncrement(bucketKey: string, limit: number, windowMinutes: number): Promise<boolean> {
    const db = getDb();
    const [existing] = await db.select().from(rateLimitBuckets).where(eq(rateLimitBuckets.bucketKey, bucketKey)).limit(1);

    const decision = decideRateLimit(
      existing ? { windowStart: existing.windowStart, requestCount: existing.requestCount } : null,
      new Date(),
      limit,
      windowMinutes,
    );

    await db
      .insert(rateLimitBuckets)
      .values({ bucketKey, windowStart: decision.nextState.windowStart, requestCount: decision.nextState.requestCount })
      .onConflictDoUpdate({
        target: rateLimitBuckets.bucketKey,
        set: { windowStart: decision.nextState.windowStart, requestCount: decision.nextState.requestCount },
      });

    return decision.allowed;
  }
}
