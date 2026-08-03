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
  locales: ["en"],
  defaultLocale: "en",
  // English has no URL prefix ("/") at launch (Blueprint §1's
  // English-only-at-launch decision); a future non-default locale gets an
  // explicit prefix ("/es/...") — next-intl's "as-needed" mode, chosen so
  // launch URLs stay clean rather than always carrying "/en/".
  localePrefix: "as-needed",
});
