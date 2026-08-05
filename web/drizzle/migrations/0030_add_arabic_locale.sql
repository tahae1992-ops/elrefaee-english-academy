-- Adds Arabic as a real, active, non-default locale (DDD §3.12) --
-- exactly the "an INSERT here, in a future migration" step 0001's own
-- seed comment anticipated when English shipped alone. Not the default
-- (English stays default per Blueprint §1/§12); RTL direction is what
-- drives `getLocaleDirection()`'s code-level RTL_LOCALES set staying in
-- sync (src/i18n/locale-direction.ts already includes "ar").
INSERT INTO "shared"."supported_locales" ("locale", "display_name", "direction", "is_active", "is_default")
VALUES ('ar', 'العربية', 'rtl', true, false);
