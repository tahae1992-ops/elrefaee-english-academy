CREATE TYPE "shared"."content_status" AS ENUM('draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'deprecated', 'archived');--> statement-breakpoint
CREATE TYPE "shared"."content_type" AS ENUM('lesson', 'exercise', 'quiz_item', 'vocabulary_entry', 'grammar_explanation', 'reading_passage', 'listening_script', 'pronunciation_activity', 'teacher_note', 'dialogue', 'assessment_item');--> statement-breakpoint
CREATE TABLE "curriculum"."content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "shared"."content_type" NOT NULL,
	"academy_id" uuid NOT NULL,
	"cefr_level" "shared"."cefr_level" NOT NULL,
	"status" "shared"."content_status" DEFAULT 'draft' NOT NULL,
	"payload" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academy_id" uuid NOT NULL,
	"cefr_level" "shared"."cefr_level" NOT NULL,
	"content_item_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "curriculum"."content_items" ADD CONSTRAINT "content_items_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."content_items" ADD CONSTRAINT "content_items_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."courses" ADD CONSTRAINT "courses_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."courses" ADD CONSTRAINT "courses_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "curriculum"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "courses_academy_cefr_level_unique" ON "curriculum"."courses" USING btree ("academy_id","cefr_level");