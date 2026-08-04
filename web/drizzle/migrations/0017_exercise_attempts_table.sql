CREATE TABLE "learning"."exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"response_payload" jsonb NOT NULL,
	"is_correct" boolean NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learning"."exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_content_items_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "curriculum"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."exercise_attempts" ADD CONSTRAINT "exercise_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "curriculum"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_attempts_user_exercise_idx" ON "learning"."exercise_attempts" USING btree ("user_id","exercise_id");--> statement-breakpoint
CREATE INDEX "exercise_attempts_user_lesson_idx" ON "learning"."exercise_attempts" USING btree ("user_id","lesson_id");