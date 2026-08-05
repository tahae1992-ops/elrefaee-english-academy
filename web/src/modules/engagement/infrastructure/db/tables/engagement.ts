import { bigint, index, integer, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
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
  (table) => [index("xp_transactions_user_idx").on(table.userId)],
);

export const xpBalances = engagementSchema.table("xp_balances", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => userProfiles.id),
  totalXp: integer("total_xp").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
