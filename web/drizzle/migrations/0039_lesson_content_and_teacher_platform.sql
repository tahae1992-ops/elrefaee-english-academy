-- Phase 21: extends the existing lesson-block content model (rather
-- than replacing it) with material (video/image/audio) references,
-- adds student activity-event tracking, a real grades/gradebook
-- concept, and the teacher-student roster this project's schema
-- already reserved a bounded context for (`instruction`, defined
-- since Sprint 1's schema-per-context design, never built into until
-- now).

-- 1. New content type for externally-sourced educational media
-- (video/image/audio), authored the same way every other content
-- kind is (curriculum.content_items.payload), referenced by id from
-- lesson blocks -- no new content table needed.
ALTER TYPE "shared"."content_type" ADD VALUE IF NOT EXISTS 'material';

-- 2. Vocabulary entries can now reference an image/pronunciation-audio
-- material -- both optional, both just FKs into the existing
-- content_items table (type='material').
ALTER TABLE "curriculum"."vocabulary_entries"
  ADD COLUMN "image_material_id" uuid REFERENCES "curriculum"."content_items"("id"),
  ADD COLUMN "audio_material_id" uuid REFERENCES "curriculum"."content_items"("id");

-- 3. Student activity-event tracking (Goal 2's "real persistent
-- progress tracking, not React state/localStorage"). Deliberately the
-- exact event set the spec asked for -- not open-ended analytics.
CREATE TYPE "shared"."activity_event_type" AS ENUM (
  'lesson_started',
  'lesson_completed',
  'section_viewed',
  'video_started',
  'video_completed',
  'vocabulary_viewed',
  'exercise_started',
  'exercise_completed',
  'quiz_started',
  'quiz_completed',
  'answer_submitted'
);

CREATE TABLE "learning"."activity_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "event_type" "shared"."activity_event_type" NOT NULL,
  "lesson_id" uuid REFERENCES "curriculum"."lessons"("id"),
  "material_id" uuid REFERENCES "curriculum"."content_items"("id"),
  "exercise_id" uuid REFERENCES "curriculum"."content_items"("id"),
  -- Small, event-specific detail (e.g. { blockIndex, blockType }) --
  -- not a dumping ground; every write site is one of the 11 event
  -- types above, chosen deliberately, not generic telemetry.
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "activity_events_user_created_idx" ON "learning"."activity_events" ("user_id", "created_at" DESC);
CREATE INDEX "activity_events_lesson_idx" ON "learning"."activity_events" ("lesson_id");
CREATE INDEX "activity_events_user_type_idx" ON "learning"."activity_events" ("user_id", "event_type");
ALTER TABLE "learning"."activity_events" ENABLE ROW LEVEL SECURITY;

-- 4. Grades -- a real gradebook, distinct from (and fed by) the
-- existing exercise_attempts/checkpoint_results/assessment.responses,
-- which record *what happened*; grades is the durable, teacher-facing
-- *scored outcome* record, with an explicit audit trail for any
-- future manual override (Goal 2: "record who changed it, previous
-- value, new value, timestamp").
CREATE TYPE "shared"."grade_type" AS ENUM ('exercise', 'quiz', 'lesson', 'assessment');

CREATE TABLE "assessment"."grades" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "grade_type" "shared"."grade_type" NOT NULL,
  -- The exercise/quiz-block/lesson content_item id this grade is for.
  "reference_id" uuid NOT NULL,
  "lesson_id" uuid REFERENCES "curriculum"."lessons"("id"),
  "score" numeric(6, 2) NOT NULL,
  "max_score" numeric(6, 2) NOT NULL,
  "percentage" numeric(5, 2) NOT NULL,
  "attempt_number" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "grades_user_created_idx" ON "assessment"."grades" ("user_id", "created_at" DESC);
CREATE INDEX "grades_reference_idx" ON "assessment"."grades" ("reference_id");
CREATE INDEX "grades_lesson_idx" ON "assessment"."grades" ("lesson_id");
ALTER TABLE "assessment"."grades" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "assessment"."grade_overrides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "grade_id" uuid NOT NULL REFERENCES "assessment"."grades"("id"),
  "changed_by" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "previous_score" numeric(6, 2) NOT NULL,
  "new_score" numeric(6, 2) NOT NULL,
  "previous_max_score" numeric(6, 2) NOT NULL,
  "new_max_score" numeric(6, 2) NOT NULL,
  "reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "grade_overrides_grade_idx" ON "assessment"."grade_overrides" ("grade_id");
ALTER TABLE "assessment"."grade_overrides" ENABLE ROW LEVEL SECURITY;

-- 5. Teacher-student roster -- lives in the `instruction` schema
-- reserved for this since Sprint 1 (schemas.ts) but never built into
-- until now. One row per (teacher, student) assignment; academy_id
-- denormalized from the assignment for the same reason
-- vocabulary_entries denormalizes it (roster reads filter on it
-- directly).
CREATE TABLE "instruction"."teacher_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "teacher_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "student_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "academy_id" uuid NOT NULL REFERENCES "academy"."academies"("id"),
  "assigned_by" uuid REFERENCES "identity"."user_profiles"("id"),
  "assigned_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "teacher_assignments_teacher_student_unique" UNIQUE ("teacher_id", "student_id")
);

CREATE INDEX "teacher_assignments_teacher_idx" ON "instruction"."teacher_assignments" ("teacher_id");
CREATE INDEX "teacher_assignments_student_idx" ON "instruction"."teacher_assignments" ("student_id");
ALTER TABLE "instruction"."teacher_assignments" ENABLE ROW LEVEL SECURITY;
