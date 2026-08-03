-- Rollback for 0000_init_schemas.sql.
--
-- drizzle-kit's migration format has no built-in down-migration runner, so
-- per Sprint Workflow rule 14 ("every migration must be reversible"), the
-- reverse operation is authored and reviewed here alongside the forward
-- migration, to be run manually via the same tooling/access path as the
-- forward migration if a rollback is ever needed (SRS §13.5/DDD §13's
-- restore-runbook discipline — a reversal path that's never been reviewed
-- isn't a real one).
--
-- CASCADE is deliberate and safe ONLY while these schemas are empty
-- (Sprint 1 — no tables exist yet in any of them). Once later sprints add
-- tables, data, and foreign keys, this file must be revisited before ever
-- being run again — it is not a general-purpose "undo everything" script.
DROP SCHEMA IF EXISTS "academy" CASCADE;
DROP SCHEMA IF EXISTS "ai" CASCADE;
DROP SCHEMA IF EXISTS "assessment" CASCADE;
DROP SCHEMA IF EXISTS "billing" CASCADE;
DROP SCHEMA IF EXISTS "curriculum" CASCADE;
DROP SCHEMA IF EXISTS "engagement" CASCADE;
DROP SCHEMA IF EXISTS "identity" CASCADE;
DROP SCHEMA IF EXISTS "instruction" CASCADE;
DROP SCHEMA IF EXISTS "learning" CASCADE;
DROP SCHEMA IF EXISTS "notifications" CASCADE;
DROP SCHEMA IF EXISTS "shared" CASCADE;
