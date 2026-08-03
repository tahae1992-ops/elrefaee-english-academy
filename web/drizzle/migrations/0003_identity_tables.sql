-- Sprint 2 Task 1 (DDD §3.1): identity's RBAC + session tables, plus
-- `academy.academies` pulled forward from Sprint 3 (Sprint Plan line
-- 185) purely because `identity.user_roles.academy_id` has a hard FK
-- to it and a Postgres FK can't target a table that doesn't exist yet.
-- No other academy feature is included here.
CREATE TYPE "shared"."cefr_level" AS ENUM('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1');--> statement-breakpoint
CREATE TABLE "academy"."academies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"vertical" varchar(40) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "identity"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(60) NOT NULL,
	"description" varchar(200),
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "identity"."refresh_token_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "refresh_token_registry_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "identity"."role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "identity"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(40) NOT NULL,
	"description" varchar(200),
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "identity"."user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(60) NOT NULL,
	"native_language" varchar(10),
	"preferred_locale" varchar(35),
	"current_level" "shared"."cefr_level",
	"accessibility_prefs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"anonymized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"academy_id" uuid,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity"."refresh_token_registry" ADD CONSTRAINT "refresh_token_registry_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academy"."academies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_granted_by_user_profiles_id_fk" FOREIGN KEY ("granted_by") REFERENCES "identity"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "identity"."user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_platform_wide_unique" ON "identity"."user_roles" USING btree ("user_id","role_id") WHERE "identity"."user_roles"."academy_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_academy_scoped_unique" ON "identity"."user_roles" USING btree ("user_id","role_id","academy_id") WHERE "identity"."user_roles"."academy_id" is not null;--> statement-breakpoint
-- `user_profiles.id` -> `auth.users.id`: hand-added, not Drizzle-managed
-- (DDD §3.1 — Supabase owns `auth.users`; modeling it as a Drizzle
-- table would let drizzle-kit believe it can alter/drop it).
ALTER TABLE "identity"."user_profiles" ADD CONSTRAINT "user_profiles_id_auth_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
-- Bootstrap seed, not user data: the one academy Sprint 1 Blueprint §18
-- assumes exists ("English Academy" itself, not a special case) —
-- mirrors 0001's `supported_locales` seed-row pattern.
INSERT INTO "academy"."academies" ("slug", "name", "vertical", "settings")
VALUES ('english-academy', 'Elrefaee English Academy', 'english', '{}');