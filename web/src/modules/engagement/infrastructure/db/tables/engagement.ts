import { bigint, date, index, integer, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { engagementSchema } from "@/shared/infrastructure/db/schemas";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";

/**
 * Review Engine slice — the first tables in the `engagement` schema
 * (declared empty since Sprint 1). Scope here is intentionally limited
 * to exactly what SRS FR-18/DB Design §3.7 specify for the XP ledger +
 * balance, since that's what this slice's "update XP after successful
 * reviews" requirement needs — streaks/badges/leaderboards are a
 * separate Gamification epic, not built here.
 *
 * `xp_transactions` is an append-only ledger, not a mutable counter,
 * chosen specifically for idempotency and auditability (DB Design's own
 * stated reason): `source_event_id` is the idempotency key that
 * physically guarantees "duplicate event delivery ⇒ XP awarded once"
 * (FR-18's acceptance criterion). `xp_balances` is a maintained
 * projection (updated transactionally alongside each ledger insert),
 * not a second source of truth — added because DB Design §14's own
 * review flagged `SUM(amount)` over an unbounded ledger as a dashboard-
 * load-time bottleneck.
 */
export const xpTransactions = engagementSchema.table(
  "xp_transactions",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    amount: integer("amount").notNull(),
    sourceEventId: uuid("source_event_id").unique(),
    reason: varchar("reason", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Phase 16: composite replaces the plain user_id index -- every
  // read (recent transactions, XP-earned-since) filters userId AND
  // orders/ranges on createdAt (migration 0036).
  (table) => [index("xp_transactions_user_created_idx").on(table.userId, table.createdAt)],
);

export const xpBalances = engagementSchema.table("xp_balances", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userProfiles.id),
  totalXp: integer("total_xp").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Gamification Engine slice — DB Design §3.7's `engagement.streaks`,
 * built to the documented schema exactly. The row is only created on a
 * learner's first qualifying activity (mirrors `vocabulary_review_state`
 * .createInitial's lazy-creation pattern) — `last_active_date` is always
 * set at creation time, so NOT NULL matches the documented schema
 * without needing a nullable exception.
 */
export const streaks = engagementSchema.table("streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userProfiles.id),
  currentStreakDays: integer("current_streak_days").notNull().default(0),
  longestStreakDays: integer("longest_streak_days").notNull().default(0),
  lastActiveDate: date("last_active_date").notNull(),
  freezeCredits: integer("freeze_credits").notNull().default(0),
});

/**
 * DB Design §3.7's `engagement.badges`/`engagement.user_badges`, built
 * to the documented schema exactly — `badges` is a small, near-static
 * reference table (seeded via migration, DB Design's own stated
 * expectation), `user_badges` the per-learner earned-join.
 */
export const badges = engagementSchema.table("badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  iconRef: varchar("icon_ref", { length: 60 }).notNull(),
});

export const userBadges = engagementSchema.table(
  "user_badges",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.badgeId] })],
);

/**
 * Not in the DB Design doc — a genuine gap, not a shortcut. "Implement
 * daily goals" needs some persisted per-learner target to compare
 * today's earned XP against; no table anywhere holds this. Kept
 * minimal (one tunable column) and lazily created like `streaks`, with
 * a sensible default rather than requiring learners to configure it
 * before the feature does anything.
 */
export const dailyGoals = engagementSchema.table("daily_goals", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userProfiles.id),
  goalXp: integer("goal_xp").notNull().default(20),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
