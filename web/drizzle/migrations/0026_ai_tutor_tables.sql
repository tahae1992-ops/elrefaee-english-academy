CREATE TABLE "ai"."interactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai"."interactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid,
	"module" varchar(40) NOT NULL,
	"provider_key" varchar(40) NOT NULL,
	"prompt_template_id" uuid,
	"cost_usd" numeric(10, 6) NOT NULL,
	"latency_ms" integer NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai"."prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar(40) NOT NULL,
	"version" integer NOT NULL,
	"template_body" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai"."tutor_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai"."tutor_messages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai"."tutor_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"conversation_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai"."interactions" ADD CONSTRAINT "interactions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."interactions" ADD CONSTRAINT "interactions_prompt_template_id_prompt_templates_id_fk" FOREIGN KEY ("prompt_template_id") REFERENCES "ai"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."prompt_templates" ADD CONSTRAINT "prompt_templates_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."tutor_conversations" ADD CONSTRAINT "tutor_conversations_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."tutor_conversations" ADD CONSTRAINT "tutor_conversations_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "curriculum"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai"."tutor_messages" ADD CONSTRAINT "tutor_messages_conversation_id_tutor_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "ai"."tutor_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_interactions_module_created_idx" ON "ai"."interactions" USING btree ("module","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_templates_module_version_unique" ON "ai"."prompt_templates" USING btree ("module","version");--> statement-breakpoint
CREATE UNIQUE INDEX "tutor_conversations_user_lesson_unique" ON "ai"."tutor_conversations" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "tutor_messages_conversation_idx" ON "ai"."tutor_messages" USING btree ("conversation_id","created_at");