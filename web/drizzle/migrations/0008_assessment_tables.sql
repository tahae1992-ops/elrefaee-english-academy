-- Placement Test slice (Sprint 9-10 schema, DDD §3.9, pulled forward
-- with explicit user approval since Curriculum/Assessment Engine
-- aren't built yet). item_bank has no content_item_id FK to
-- curriculum.content_items — that table doesn't exist (Curriculum
-- Engine, Sprint 4-5); item content is stored directly here instead,
-- a deliberate MVP simplification to revisit once that engine lands.
CREATE TYPE "shared"."skill_type" AS ENUM('listening', 'reading', 'writing', 'speaking', 'grammar', 'vocabulary');--> statement-breakpoint
CREATE TABLE "assessment"."attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"blueprint_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"self_assessed_level" "shared"."cefr_level",
	"assembled_items" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessment"."item_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academy_id" uuid NOT NULL,
	"skill" "shared"."skill_type" NOT NULL,
	"cefr_level" "shared"."cefr_level" NOT NULL,
	"difficulty" numeric(4, 2) NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"prompt" jsonb NOT NULL,
	"scoring_key" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"response_payload" jsonb NOT NULL,
	"is_correct" boolean,
	"scored_by" varchar(10) DEFAULT 'auto' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_levels" jsonb NOT NULL,
	"overall_level" "shared"."cefr_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "results_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_blueprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academy_id" uuid NOT NULL,
	"key" varchar(60) NOT NULL,
	"rules" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_blueprints_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "assessment"."attempts" ADD CONSTRAINT "attempts_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."attempts" ADD CONSTRAINT "attempts_blueprint_id_test_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "assessment"."test_blueprints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."item_bank" ADD CONSTRAINT "item_bank_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."responses" ADD CONSTRAINT "responses_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "assessment"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."responses" ADD CONSTRAINT "responses_item_id_item_bank_id_fk" FOREIGN KEY ("item_id") REFERENCES "assessment"."item_bank"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."results" ADD CONSTRAINT "results_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "assessment"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."results" ADD CONSTRAINT "results_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_blueprints" ADD CONSTRAINT "test_blueprints_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_attempts_user_id_idx" ON "assessment"."attempts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_responses_attempt_item_unique" ON "assessment"."responses" USING btree ("attempt_id","item_id");