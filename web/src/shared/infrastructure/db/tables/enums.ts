import { sharedSchema } from "@/shared/infrastructure/db/schemas";

/**
 * DDD §2's shared domain enums — "defined once, reused everywhere." A
 * Postgres enum type is schema-scoped exactly like a table, so this
 * lives under `shared` rather than being redeclared per bounded
 * context: a `cefr_level` typo stays a compile-time error everywhere
 * it's used (identity now; curriculum, assessment, learning later),
 * not just in whichever module happened to declare it first.
 */
export const cefrLevel = sharedSchema.enum("cefr_level", [
  "pre_a1",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
]);

/** DDD §2's shared `skill_type` enum. */
export const skillType = sharedSchema.enum("skill_type", [
  "listening",
  "reading",
  "writing",
  "speaking",
  "grammar",
  "vocabulary",
]);

/**
 * DDD §3.3's shared `content_type` enum — every authorable content kind
 * across the platform. `material` (Phase 21) is the one addition beyond
 * the original DDD list — externally-sourced video/image/audio,
 * authored the same way as everything else here (a `content_items` row)
 * rather than a parallel media table.
 */
export const contentType = sharedSchema.enum("content_type", [
  "lesson",
  "exercise",
  "quiz_item",
  "vocabulary_entry",
  "grammar_explanation",
  "reading_passage",
  "listening_script",
  "pronunciation_activity",
  "teacher_note",
  "dialogue",
  "assessment_item",
  "material",
]);

/** Phase 21 — Goal 2's real persistent activity tracking (learning.activity_events), the exact event set specified, not open-ended analytics. */
export const activityEventType = sharedSchema.enum("activity_event_type", [
  "lesson_started",
  "lesson_completed",
  "section_viewed",
  "video_started",
  "video_completed",
  "vocabulary_viewed",
  "exercise_started",
  "exercise_completed",
  "quiz_started",
  "quiz_completed",
  "answer_submitted",
]);

/** Phase 21 — assessment.grades's grade_type: the 4 scored-outcome kinds the gradebook tracks. */
export const gradeType = sharedSchema.enum("grade_type", ["exercise", "quiz", "lesson", "assessment"]);

/** DDD §3.3's shared `content_status` enum — the Content Governance lifecycle (Blueprint §4.1). */
export const contentStatus = sharedSchema.enum("content_status", [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "scheduled",
  "published",
  "deprecated",
  "archived",
]);
