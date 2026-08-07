import { integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { sharedSchema } from "@/shared/infrastructure/db/schemas";

/** SRS §6.4 / API Spec §7.4 — a DB-backed fixed-window rate limiter (migration 0035). Scoped generically, not certificate-specific, so Phase 17 Security's broader per-user/IP layer can reuse it. */
export const rateLimitBuckets = sharedSchema.table("rate_limit_buckets", {
  bucketKey: varchar("bucket_key", { length: 200 }).primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  requestCount: integer("request_count").notNull().default(1),
});
