CREATE TABLE "curriculum"."vocabulary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"academy_id" uuid NOT NULL,
	"headword" varchar(100) NOT NULL,
	"sense_number" smallint DEFAULT 1 NOT NULL,
	"ipa_transcription" varchar(150) NOT NULL,
	"part_of_speech" varchar(30) NOT NULL,
	"cefr_level" "shared"."cefr_level" NOT NULL,
	"tier" varchar(10) NOT NULL,
	"collocations" text[] DEFAULT '{}' NOT NULL,
	"synonyms" text[] DEFAULT '{}' NOT NULL,
	"example_sentences" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement"."xp_balances" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement"."xp_transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "engagement"."xp_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source_event_id" uuid,
	"reason" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "xp_transactions_source_event_id_unique" UNIQUE("source_event_id")
);
--> statement-breakpoint
CREATE TABLE "learning"."vocabulary_review_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vocabulary_entry_id" uuid NOT NULL,
	"stability" numeric(8, 4) NOT NULL,
	"difficulty" numeric(8, 4) NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"review_count" integer DEFAULT 0 NOT NULL,
	"last_event_id" uuid
);
--> statement-breakpoint
ALTER TABLE "curriculum"."vocabulary_entries" ADD CONSTRAINT "vocabulary_entries_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "curriculum"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum"."vocabulary_entries" ADD CONSTRAINT "vocabulary_entries_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement"."xp_balances" ADD CONSTRAINT "xp_balances_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement"."xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."vocabulary_review_state" ADD CONSTRAINT "vocabulary_review_state_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning"."vocabulary_review_state" ADD CONSTRAINT "vocabulary_review_state_vocabulary_entry_id_vocabulary_entries_id_fk" FOREIGN KEY ("vocabulary_entry_id") REFERENCES "curriculum"."vocabulary_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "vocabulary_entries_academy_headword_sense_unique" ON "curriculum"."vocabulary_entries" USING btree ("academy_id","headword","sense_number");--> statement-breakpoint
CREATE INDEX "xp_transactions_user_idx" ON "engagement"."xp_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vocabulary_review_state_user_entry_unique" ON "learning"."vocabulary_review_state" USING btree ("user_id","vocabulary_entry_id");--> statement-breakpoint
CREATE INDEX "vocabulary_review_state_user_due_idx" ON "learning"."vocabulary_review_state" USING btree ("user_id","due_at");