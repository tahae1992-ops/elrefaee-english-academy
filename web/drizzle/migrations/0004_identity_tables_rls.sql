-- RLS for Sprint 2 Task 1's identity + academy tables (SRS §12.2's "RLS
-- policy exists for every table" rule, Sprint 2 DoD). Unlike 0002's
-- interim enable-with-no-policies state (written before any role system
-- existed), these get real policies now: the role system IS what this
-- task builds, and every table here is either directly self-scoped
-- (a user reading their own data) or read-only reference data.
--
-- Every write path below is deliberately absent, not deferred: account
-- creation, role granting, and MFA/session bookkeeping all happen via
-- AuthService/RoleResolver (Tasks 2-3) using Supabase's service-role
-- key, which bypasses RLS entirely by design. Nothing in this
-- migration grants the `authenticated` or `anon` Postgres roles any
-- INSERT/UPDATE/DELETE — that absence IS the policy: default-deny.

ALTER TABLE "identity"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "identity"."refresh_token_registry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academy"."academies" ENABLE ROW LEVEL SECURITY;

-- A user may read and update only their own profile row. No client
-- INSERT (rows are created by AuthService on registration, service
-- role) and no client DELETE (GDPR deletion is anonymization via an
-- UPDATE, not a row delete — DDD §6.2 — and even that anonymizing
-- UPDATE runs through the service role, not this self-update policy,
-- since it must also scrub `auth.users`' email via the Admin API in
-- the same operation).
CREATE POLICY "user_profiles_select_own" ON "identity"."user_profiles"
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "user_profiles_update_own" ON "identity"."user_profiles"
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Near-static RBAC reference data (DDD §3.1: "read-heavy but tiny and
-- cacheable") — every authenticated user may read it (a client needs
-- to resolve its own permission set), nobody but the service role may
-- write it.
CREATE POLICY "roles_select_authenticated" ON "identity"."roles"
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "permissions_select_authenticated" ON "identity"."permissions"
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "role_permissions_select_authenticated" ON "identity"."role_permissions"
  FOR SELECT TO authenticated
  USING (true);

-- A user may see only their own role grants — never another user's,
-- and never by scanning across academies. This is also the policy
-- Task 9's RLS cross-user access test suite proves.
CREATE POLICY "user_roles_select_own" ON "identity"."user_roles"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Refresh tokens are a pure server-side session-management concern
-- (SRS §12.8) — no policy is granted to `authenticated` or `anon` at
-- all, so this table is completely inert from the client's
-- perspective; only the service role (AuthService) ever touches it.

-- Academies: read-only reference data at this stage (one row, "English
-- Academy" — DDD §3.2). Real academy-scoped RLS (a user seeing only
-- their own academy's data across other tenant-scoped tables) is
-- Sprint 3 scope per the Sprint Plan; this policy only covers this
-- table's own rows, which is all Task 1 owns.
CREATE POLICY "academies_select_authenticated" ON "academy"."academies"
  FOR SELECT TO authenticated
  USING (true);
