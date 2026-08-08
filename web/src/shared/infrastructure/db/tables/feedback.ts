import { index, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sharedSchema } from "@/shared/infrastructure/db/schemas";

/**
 * Phase 19 (Beta Release) — "feedback instrumentation." Lives in the
 * `shared` schema (not a 12th bounded-context schema — DDD §1 fixes
 * the count at 11) since it isn't owned by any single existing
 * context, the same placement as audit_log/rate_limit_buckets. `user_id`
 * is a bare uuid, not a Drizzle `.references()` FK, matching audit_log's
 * `actor_id` -- a `shared`-schema table reaching into
 * modules/identity/infrastructure's internals to import `userProfiles`
 * would violate the module-boundary arch-check rule (SAD §4); the real
 * FK constraint is enforced at the SQL level in the migration instead.
 */
export const feedbackCategory = sharedSchema.enum("feedback_category", ["bug", "suggestion", "other"]);
export const feedbackStatus = sharedSchema.enum("feedback_status", ["new", "reviewed", "resolved"]);

export const feedbackSubmissions = sharedSchema.table(
  "feedback_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    category: feedbackCategory("category").notNull(),
    message: text("message").notNull(),
    // Where the learner was when they opened the form — context for
    // triage, not a tracking mechanism (no IP/user-agent captured).
    pageUrl: varchar("page_url", { length: 500 }),
    status: feedbackStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("feedback_submissions_user_id_idx").on(table.userId),
    index("feedback_submissions_status_idx").on(table.status),
  ],
);
