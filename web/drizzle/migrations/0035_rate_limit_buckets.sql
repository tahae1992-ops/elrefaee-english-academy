-- IP-based rate limiting for the certificate verification endpoint
-- (SRS §6.4, API Spec §7.4, roadmap Phase 14's named security work:
-- "the verification endpoint's IP-based rate limiting... it has no
-- auth gate to lean on"). A DB-backed fixed-window counter rather
-- than an external service (Upstash/Redis) -- no such service is
-- provisioned in this environment, and provisioning one is a
-- deployment/account decision outside what this migration should
-- assume. This table is scoped generically (bucket_key, not
-- certificate-specific) so Phase 17 Security's broader per-user/IP
-- layer can reuse it instead of introducing a second mechanism.
CREATE TABLE "shared"."rate_limit_buckets" (
  "bucket_key" varchar(200) PRIMARY KEY,
  "window_start" timestamptz NOT NULL,
  "request_count" integer NOT NULL DEFAULT 1
);

ALTER TABLE "shared"."rate_limit_buckets" ENABLE ROW LEVEL SECURITY;
-- Zero-policy-by-design, same pattern as item_bank: internal
-- infrastructure state, never read or written by a client role --
-- all access is through the app's own privileged DB connection.
