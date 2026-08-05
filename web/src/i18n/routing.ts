import { defineRouting } from "next-intl/routing";

/**
 * The routing-layer locale registry. Distinct from `shared.supported_locales`
 * (DDD §3.12), which is the admin-manageable "what's shown in the switcher"
 * source of truth — this array is what next-intl's routing needs to resolve
 * URL prefixes correctly. Adding a locale here is a small code change +
 * deploy (a new message catalog file, one array entry), never a database
 * migration — the schema itself never changes to add a language, which is
 * the specific claim Blueprint §12 makes. Conflating "no schema migration"
 * with "no deploy at all" would overstate that claim, so this comment
 * exists to keep the two honest and separate.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // English has no URL prefix ("/") — Blueprint §12's English-default
  // decision; Arabic (and any future locale) gets an explicit prefix
  // ("/ar/...") — next-intl's "as-needed" mode, chosen so the default
  // locale's URLs stay clean rather than always carrying "/en/". Adding
  // Arabic here is exactly the "one array entry + one message catalog"
  // change the comment above describes — no other code in this file
  // changed to support it.
  localePrefix: "as-needed",
});
