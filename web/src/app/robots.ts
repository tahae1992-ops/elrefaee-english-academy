import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/lib/get-site-origin";

/**
 * The authoritative gate — every authenticated/transactional/dynamic
 * route is disallowed here regardless of whether it also carries its
 * own page-level `noindex` (defense in depth, and the single place
 * that covers routes like /lessons, /units, /exams, /review,
 * /placement-test that don't share one common layout to hang
 * metadata off of).
 */
// English is unprefixed and Arabic is "/ar/..." (routing.ts's
// "as-needed" localePrefix) -- each disallowed path needs both forms
// listed, or the Arabic app surface would be silently indexable.
const DISALLOWED_PATHS = [
  "/api/",
  "/dashboard",
  "/courses",
  "/certificates",
  "/lessons",
  "/units",
  "/exams",
  "/review",
  "/placement-test",
  "/roles",
  "/reset-password",
  "/design-system",
  "/teacher",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_PATHS, ...DISALLOWED_PATHS.map((path) => `/ar${path}`)],
    },
    sitemap: `${getCanonicalSiteOrigin()}/sitemap.xml`,
  };
}
