import { sql } from "drizzle-orm";
import { jsonb, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { academySchema } from "@/shared/infrastructure/db/schemas";

/**
 * DDD §3.2 — pulled forward from Sprint 3 (Sprint Plan line 185) into
 * Sprint 2 Task 1, not as scope creep but because `identity.user_roles
 * .academy_id` has a hard FK to this table (DDD §3.1) and a Postgres FK
 * can't target a table that doesn't exist yet. Scope is intentionally
 * limited to exactly what DDD §3.2 specifies plus the one seed row — no
 * additional academy features (membership, admin UI, `/academies`
 * endpoint) land until Sprint 3 actually owns this schema.
 */
export const academies = academySchema.table("academies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  vertical: varchar("vertical", { length: 40 }).notNull(),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
