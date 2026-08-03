CREATE TABLE "shared"."certificate_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(60) NOT NULL,
	"locale" varchar(35) NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications"."templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(60) NOT NULL,
	"locale" varchar(35) NOT NULL,
	"channel" varchar(10) NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	CONSTRAINT "notification_templates_channel_check" CHECK ("notifications"."templates"."channel" in ('in_app', 'email', 'push'))
);
--> statement-breakpoint
CREATE TABLE "shared"."supported_locales" (
	"locale" varchar(35) PRIMARY KEY NOT NULL,
	"display_name" varchar(60) NOT NULL,
	"direction" varchar(3) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	CONSTRAINT "direction_check" CHECK ("shared"."supported_locales"."direction" in ('ltr', 'rtl'))
);
--> statement-breakpoint
ALTER TABLE "shared"."certificate_templates" ADD CONSTRAINT "certificate_templates_locale_supported_locales_locale_fk" FOREIGN KEY ("locale") REFERENCES "shared"."supported_locales"("locale") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications"."templates" ADD CONSTRAINT "templates_locale_supported_locales_locale_fk" FOREIGN KEY ("locale") REFERENCES "shared"."supported_locales"("locale") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_templates_key_locale" ON "shared"."certificate_templates" USING btree ("template_key","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_templates_key_locale_channel" ON "notifications"."templates" USING btree ("key","locale","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "supported_locales_one_default" ON "shared"."supported_locales" USING btree ("is_default") WHERE "shared"."supported_locales"."is_default" = true;
--> statement-breakpoint
-- Bootstrap seed, not user data: DDD §3.12's resolution algorithm needs at
-- least the default locale to exist for the fallback step to resolve
-- anything. English-only at launch (Blueprint §1/§12) — this is the one
-- row Sprint 1.5 ships; a real second locale is added the same way
-- (an INSERT here, in a future migration) once one is actually built.
INSERT INTO "shared"."supported_locales" ("locale", "display_name", "direction", "is_active", "is_default")
VALUES ('en', 'English', 'ltr', true, true);