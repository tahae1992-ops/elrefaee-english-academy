import { headers } from "next/headers";

/**
 * The app's own origin, derived from the incoming request rather than
 * a hardcoded env var — works unmodified across local dev, every
 * Vercel preview URL, and production, which a single `NEXT_PUBLIC_SITE_URL`
 * would not (Vercel preview deployments each get a unique URL).
 * Needed anywhere a fully-qualified URL must leave the server context
 * itself — email links (password reset) and SEO metadata (sitemap,
 * canonical/OpenGraph URLs).
 */
export async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * The canonical production origin — unlike `getSiteOrigin`, this is
 * deliberately *not* request-derived: robots.txt/sitemap.xml must
 * always point at the one real production domain, never whichever
 * preview URL happened to render them, and staying header-free keeps
 * these files cacheable (Next's own documented default for
 * `robots.ts`/`sitemap.ts`). `VERCEL_PROJECT_PRODUCTION_URL` is a
 * Vercel System Environment Variable, populated automatically with no
 * manual configuration required.
 */
export function getCanonicalSiteOrigin(): string {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return productionHost ? `https://${productionHost}` : "http://localhost:3000";
}
