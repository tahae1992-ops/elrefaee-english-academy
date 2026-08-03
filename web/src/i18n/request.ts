import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

/**
 * Loads the message catalog for the current request's resolved locale.
 *
 * DDD §3.12's full resolution order is: (1) an authenticated user's
 * `preferred_locale`, (2) Accept-Language, (3) default. Steps 2–3 are
 * handled natively by next-intl's proxy/middleware (src/proxy.ts) before
 * this ever runs. Step 1 (the authenticated-user override) has no auth
 * layer to read from yet — that lands in Sprint 2. Noted explicitly here
 * rather than silently deferred, so it isn't mistaken for "already done."
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
