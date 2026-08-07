export interface RateLimitBucketState {
  windowStart: Date;
  requestCount: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** The bucket state to persist -- either the incremented current window, or a fresh window starting now. */
  nextState: RateLimitBucketState;
}

/**
 * SRS §6.4's fixed-window rate limiter (token-bucket is the SRS's
 * stated ideal; a fixed window is the deliberately simpler MVP
 * primitive this DB-backed implementation uses instead -- no
 * external rate-limiting service is provisioned in this environment,
 * per Phase 14's roadmap note). Pure decision logic: given the
 * bucket's last-known state (or none), the current time, and the
 * configured limit/window, decide whether this request is allowed
 * and what the persisted state should become.
 */
export function decideRateLimit(
  existing: RateLimitBucketState | null,
  now: Date,
  limit: number,
  windowMinutes: number,
): RateLimitDecision {
  const windowMs = windowMinutes * 60 * 1000;
  const windowExpired = !existing || now.getTime() - existing.windowStart.getTime() >= windowMs;

  if (windowExpired) {
    return { allowed: true, nextState: { windowStart: now, requestCount: 1 } };
  }

  const nextCount = existing.requestCount + 1;
  return {
    allowed: nextCount <= limit,
    nextState: { windowStart: existing.windowStart, requestCount: nextCount },
  };
}
