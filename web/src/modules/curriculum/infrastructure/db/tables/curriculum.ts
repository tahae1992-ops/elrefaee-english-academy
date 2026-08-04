import { sql } from "drizzle-orm";
import { jsonb, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { curriculumSchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { cefrLevel, contentStatus, contentType } from "@/shared/infrastructure/db/tables/enums";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";

/**
 * Course Catalog slice — a trimmed slice of the Curriculum Engine
 * (DDD §3.3, Sprint 4-5) pulled forward, same pattern as the
 * Placement Test slice's trimmed Assessment Engine (see
 * assessment.ts's header comment). Two deliberate simplifications
 * against the full DDD schema, both disclosed here:
 *
 * 1. `content_items` carries a `payload` jsonb column directly instead
 *    of pointing at `content_versions`/`current_published_version_id`.
 *    The full versioning + review workflow (`content_versions`,
 *    `content_reviews`) is a CMS-authoring feature with no authoring
 *    UI or reviewer role flow built yet — there is nothing to version
 *    against. `status` (the real 8-state DDD enum) still gates what a
 *    learner can see, which is the actual business rule this slice
 *    needs (SRS FR-04: "Only Published content is ever exposed").
 * 2. `content_items.created_by` is nullable here, not NOT NULL as DDD
 *    specifies. A real FK to `user_profiles` can only reference an
 *    actual registered (Supabase Auth-backed) user — there is no
 *    seedable "system author" account, since no CMS/authoring identity
 *    concept exists yet. Seed content (authored by Claude per the
 *    project's content workflow, pending review) leaves this null.
 *
 * `units`/`lessons` are intentionally not built in this slice — the
 * Course Catalog screen (doc 08 §4.7) only lists courses; unit/lesson
 * browsing is the separate, later "Course Details" screen.
 */

export const contentItems = curriculumSchema.table("content_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: contentType("type").notNull(),
  academyId: uuid("academy_id")
    .notNull()
    .references(() => academies.id),
  cefrLevel: cefrLevel("cefr_level").notNull(),
  status: contentStatus("status").notNull().default("draft"),
  // { title: string, description: string } — see header comment (1).
  payload: jsonb("payload").notNull(),
  createdBy: uuid("created_by").references(() => userProfiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courses = curriculumSchema.table(
  "courses",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id),
    cefrLevel: cefrLevel("cefr_level").notNull(),
    contentItemId: uuid("content_item_id").references(() => contentItems.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("courses_academy_cefr_level_unique").on(table.academyId, table.cefrLevel)],
);
