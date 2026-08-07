export interface RateLimiterPort {
  /** Applies rate-limit-window.ts's decision against the bucket's persisted state and atomically persists the result. Returns whether this request is allowed. */
  checkAndIncrement(bucketKey: string, limit: number, windowMinutes: number): Promise<boolean>;
}
