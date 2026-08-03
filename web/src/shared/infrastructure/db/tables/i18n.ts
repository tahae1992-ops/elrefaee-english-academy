import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { notificationsSchema, sharedSchema } from "@/shared/infrastructure/db/schemas";

/**
 * DDD §3.12 — the i18n architecture revision's translation tables.
 *
 * Placed under `shared/infrastructure` rather than an owning module's own
 * infrastructure layer because these tables are being created *ahead of*
 * the modules that will eventually own them (`notifications` isn't built
 * until Sprint 12, DDD §3.12 was written retroactively into an
 * already-approved doc). `notifications.templates` should move into
 * `modules/notifications/infrastructure/` when that module is actually
 * built — flagged here so it isn't forgotten, not left as a silent
 * permanent exception to the module-ownership rule (SAD §4).
 */

export const supportedLocales = sharedSchema.table(
  "supported_locales",
  {
    locale: varchar("locale", { length: 35 }).primaryKey(),
    displayName: varchar("display_name", { length: 60 }).notNull(),
    direction: varchar("direction", { length: 3 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [
    check("direction_check", sql`${table.direction} in ('ltr', 'rtl')`),
    // Only one row may be the default locale — a partial unique index,
    // not a plain unique constraint (DDD §3.12).
    uniqueIndex("supported_locales_one_default")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true`),
  ],
);

export const certificateTemplates = sharedSchema.table(
  "certificate_templates",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    templateKey: varchar("template_key", { length: 60 }).notNull(),
    locale: varchar("locale", { length: 35 })
      .notNull()
      .references(() => supportedLocales.locale),
    body: text("body").notNull(),
  },
  (table) => [
    uniqueIndex("certificate_templates_key_locale").on(
      table.templateKey,
      table.locale,
    ),
  ],
);

export const notificationTemplates = notificationsSchema.table(
  "templates",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    key: varchar("key", { length: 60 }).notNull(),
    locale: varchar("locale", { length: 35 })
      .notNull()
      .references(() => supportedLocales.locale),
    channel: varchar("channel", { length: 10 }).notNull(),
    subject: text("subject"),
    body: text("body").notNull(),
  },
  (table) => [
    check(
      "notification_templates_channel_check",
      sql`${table.channel} in ('in_app', 'email', 'push')`,
    ),
    uniqueIndex("notification_templates_key_locale_channel").on(
      table.key,
      table.locale,
      table.channel,
    ),
  ],
);
