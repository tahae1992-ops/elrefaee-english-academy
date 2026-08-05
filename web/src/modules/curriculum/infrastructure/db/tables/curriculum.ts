import { sql } from "drizzle-orm";
import { integer, jsonb, smallint, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
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
 * Lesson Viewer slice adds `units`/`lessons`. Both `content_item_id`
 * columns are NOT NULL (unlike `courses.content_item_id`, nullable per
 * DDD) — every unit/lesson built here is authored with real content,
 * there's no "structure before authoring" case to support yet. Their
 * `content_type` is `lesson` — the enum has no dedicated
 * unit/course-overview type, so the closest fit is reused, same
 * documented choice already made for `courses` above.
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

export const units = curriculumSchema.table(
  "units",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("units_course_order_unique").on(table.courseId, table.orderIndex)],
);

export const lessons = curriculumSchema.table(
  "lessons",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lessons_unit_order_unique").on(table.unitId, table.orderIndex)],
);

/**
 * Review Engine slice — DB Design §3.3's `curriculum.vocabulary_entries`
 * (the vocabulary spine, EDD §7), built to the documented schema exactly.
 * `academy_id` is denormalized from `content_items` per the doc's own
 * stated reason: review-queue reads filter on it directly and can't
 * afford a join at that read volume.
 *
 * Lesson wrap-up blocks queue both genuine vocabulary words and short
 * grammar chunks (EDD §5's "target vocabulary/grammar chunks are queued
 * into spaced repetition") into this same table — the DB Design doc
 * defines no separate grammar-chunk entity, so a chunk like "she is" is
 * authored here with `part_of_speech = 'phrase'`, reusing the one
 * approved reviewable-item schema rather than inventing a second one.
 */
export const vocabularyEntries = curriculumSchema.table(
  "vocabulary_entries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id),
    headword: varchar("headword", { length: 100 }).notNull(),
    senseNumber: smallint("sense_number").notNull().default(1),
    ipaTranscription: varchar("ipa_transcription", { length: 150 }).notNull(),
    partOfSpeech: varchar("part_of_speech", { length: 30 }).notNull(),
    cefrLevel: cefrLevel("cefr_level").notNull(),
    // 'active' | 'receptive' (EDD §7) — enforced application-side only, matching this codebase's existing convention for similar small enums.
    tier: varchar("tier", { length: 10 }).notNull(),
    collocations: text("collocations").array().notNull().default([]),
    synonyms: text("synonyms").array().notNull().default([]),
    // { text: string }[] — at least one authored example sentence.
    exampleSentences: jsonb("example_sentences").notNull(),
  },
  (table) => [uniqueIndex("vocabulary_entries_academy_headword_sense_unique").on(table.academyId, table.headword, table.senseNumber)],
);
