import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/lib/get-site-origin";

// Only the genuinely public, content-bearing pages -- login/register
// are conversion entry points worth indexing; every authenticated,
// transactional, or draft-legal page is deliberately left out (and
// disallowed outright in robots.ts).
const PUBLIC_PATHS = ["/login", "/register"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getCanonicalSiteOrigin();

  return PUBLIC_PATHS.flatMap((path) => [
    {
      url: `${origin}${path}`,
      alternates: { languages: { ar: `${origin}/ar${path}` } },
    },
    {
      url: `${origin}/ar${path}`,
    },
  ]);
}
