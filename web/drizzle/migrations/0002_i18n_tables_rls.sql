-- Closes a critical finding from Supabase's own security advisor,
-- surfaced immediately after 0001 applied: RLS was disabled on all 3 new
-- tables, exposing them fully to the anon/authenticated client roles
-- (SRS §12.2's "RLS policy exists for every table before merge" rule,
-- enforced here manually since Sprint 1.5 predates the CI-automated
-- version of that check, which lands with more schema/RLS tooling in
-- Sprint 2).
--
-- Enabling RLS with NO policies yet is the correct interim state, not an
-- oversight: none of these 3 tables are queried by any application code
-- today (the locale switcher reads the static `routing.locales` config,
-- not this table — DDD §3.12's registry is the admin-facing source of
-- truth, not yet wired to a read path). Postgres RLS defaults to
-- deny-all with zero policies, which is the safest possible state for a
-- table nothing touches yet. Real policies (public read on
-- supported_locales; Super-Admin-scoped writes on all three) get added
-- once Sprint 2 builds the role/permission system real policies would
-- need to reference — writing them against a role system that doesn't
-- exist yet would be guessing, not securing.
ALTER TABLE "shared"."supported_locales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared"."certificate_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"."templates" ENABLE ROW LEVEL SECURITY;
