import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { identitySchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { cefrLevel } from "@/shared/infrastructure/db/tables/enums";

/**
 * DDD §3.1 — Sprint 2's RBAC + session data model.
 *
 * `user_profiles.id` intentionally has no Drizzle-level `.references()`
 * to `auth.users` (Supabase-managed, "which we do not own or redesign"
 * — DDD §3.1). Modeling Supabase's internal `auth` schema here would
 * let drizzle-kit believe it owns and can alter/drop that table. The FK
 * constraint is still enforced — added by hand directly in the
 * generated migration (0003_identity_tables.sql) instead.
 */

export const userProfiles = identitySchema.table("user_profiles", {
  id: uuid("id").primaryKey(),
  displayName: varchar("display_name", { length: 60 }).notNull(),
  nativeLanguage: varchar("native_language", { length: 10 }),
  preferredLocale: varchar("preferred_locale", { length: 35 }),
  currentLevel: cefrLevel("current_level"),
  accessibilityPrefs: jsonb("accessibility_prefs").notNull().default({}),
  anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roles = identitySchema.table("roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 40 }).notNull().unique(),
  description: varchar("description", { length: 200 }),
});

export const permissions = identitySchema.table("permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 60 }).notNull().unique(),
  description: varchar("description", { length: 200 }),
});

export const rolePermissions = identitySchema.table(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const userRoles = identitySchema.table(
  "user_roles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    academyId: uuid("academy_id").references(() => academies.id),
    grantedBy: uuid("granted_by").references(() => userProfiles.id),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("user_roles_user_id_idx").on(table.userId),
    // DDD §3.1's corrected constraint: a plain UNIQUE(user_id, role_id,
    // academy_id) does NOT prevent duplicate platform-wide role grants,
    // because Postgres treats NULL academy_id values as distinct under
    // a regular unique constraint. Two partial unique indexes close
    // that gap instead.
    uniqueIndex("user_roles_platform_wide_unique")
      .on(table.userId, table.roleId)
      .where(sql`${table.academyId} is null`),
    uniqueIndex("user_roles_academy_scoped_unique")
      .on(table.userId, table.roleId, table.academyId)
      .where(sql`${table.academyId} is not null`),
  ],
);

export const refreshTokenRegistry = identitySchema.table("refresh_token_registry", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => userProfiles.id),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
