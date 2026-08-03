import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Next.js 16 renamed Middleware to Proxy (file: proxy.ts, not
 * middleware.ts) — functionality is unchanged; next-intl's own exported
 * function is still named/imported as "middleware" regardless of the
 * file it lives in. Handles DDD §3.12's resolution steps 2–3
 * (Accept-Language negotiation, then default) and persists an explicit
 * choice to a cookie; step 1 (authenticated user's preferred_locale)
 * layers in once Sprint 2's auth exists.
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Run on every path except static assets, Next internals, and the API
  // (the API is deliberately locale-segment-agnostic, SAD §5 addendum).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
