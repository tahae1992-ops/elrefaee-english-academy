-- RLS for shared.audit_log (SRS §12.2). Immutable, service-side-only
-- table by design (DDD §5.6: "no UPDATE/DELETE grants... for any role
-- including Super Admin"). No client policy exists yet — same
-- deliberate zero-policy pattern as 0004's refresh_token_registry:
-- nothing reads this table through the client roles until the Admin
-- "Access audit log" screen (SRS §4) is built.
ALTER TABLE "shared"."audit_log" ENABLE ROW LEVEL SECURITY;
