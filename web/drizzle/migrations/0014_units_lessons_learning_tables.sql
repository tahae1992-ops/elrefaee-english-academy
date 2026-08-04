CREATE TABLE "curriculum"."lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum"."units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning"."enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"academy_id" uuid NOT NULL,
	"current_course_id" uuid NOT NULL,
	"current_unit_id" uuid,
	"placement_method" varchar(20) NOT NULL,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning"."progress_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" varchar(15) DEFAULT 'not_started' NOT NULL,
	"last_position" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "curriculum"."lessons" ADD CONSTRAINT "lessons_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "curriculum"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."lessons" ADD CONSTRAINT "lessons_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "curriculum"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."units" ADD CONSTRAINT "units_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "curriculum"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."units" ADD CONSTRAINT "units_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "curriculum"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."enrollments" ADD CONSTRAINT "enrollments_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."enrollments" ADD CONSTRAINT "enrollments_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."enrollments" ADD CONSTRAINT "enrollments_current_course_id_courses_id_fk" FOREIGN KEY ("current_course_id") REFERENCES "curriculum"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."enrollments" ADD CONSTRAINT "enrollments_current_unit_id_units_id_fk" FOREIGN KEY ("current_unit_id") REFERENCES "curriculum"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."progress_records" ADD CONSTRAINT "progress_records_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."progress_records" ADD CONSTRAINT "progress_records_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "curriculum"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_unit_order_unique" ON "curriculum"."lessons" USING btree ("unit_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "units_course_order_unique" ON "curriculum"."units" USING btree ("course_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_user_academy_unique" ON "learning"."enrollments" USING btree ("user_id","academy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_records_user_lesson_unique" ON "learning"."progress_records" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "progress_records_user_status_idx" ON "learning"."progress_records" USING btree ("user_id","status");