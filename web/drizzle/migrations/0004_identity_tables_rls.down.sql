-- Rollback for 0004_identity_tables_rls.sql.
DROP POLICY IF EXISTS "academies_select_authenticated" ON "academy"."academies";
DROP POLICY IF EXISTS "user_roles_select_own" ON "identity"."user_roles";
DROP POLICY IF EXISTS "role_permissions_select_authenticated" ON "identity"."role_permissions";
DROP POLICY IF EXISTS "permissions_select_authenticated" ON "identity"."permissions";
DROP POLICY IF EXISTS "roles_select_authenticated" ON "identity"."roles";
DROP POLICY IF EXISTS "user_profiles_update_own" ON "identity"."user_profiles";
DROP POLICY IF EXISTS "user_profiles_select_own" ON "identity"."user_profiles";

ALTER TABLE "academy"."academies" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."refresh_token_registry" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."role_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."user_profiles" DISABLE ROW LEVEL SECURITY;
