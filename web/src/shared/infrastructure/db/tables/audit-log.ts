import { bigint, inet, jsonb, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sharedSchema } from "@/shared/infrastructure/db/schemas";

/**
 * DDD §5.6 — pulled forward from its own later sprint into the Login
 * slice, minimally, because API Spec §7.1 requires every login attempt
 * (success and failure) to be audit-logged. No partitioning yet
 * (DDD §11's optimization, not an MVP correctness requirement).
 */
export const auditLog = sharedSchema.table("audit_log", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 60 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  ipAddress: inet("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
