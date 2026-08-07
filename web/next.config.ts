import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Phase 17 Security Hardening (roadmap): standard security response
 * headers applied to every route, pages and API alike. Kept
 * pragmatic rather than maximally strict -- this app has no
 * nonce-based script wiring, so `script-src`/`style-src` need
 * `'unsafe-inline'` for Next.js's own hydration bootstrap and
 * Tailwind/Radix's inline styles; tightening that further is real
 * follow-up work (nonce plumbing through proxy.ts), not something to
 * fake by shipping a CSP that would silently break the app. No
 * `<iframe>`/browser-side Supabase client exists anywhere in this
 * codebase (confirmed via audit) -- all Supabase access is
 * server-side, so `connect-src` only needs to cover this app's own
 * origin plus Sentry's ingest endpoints (for when a real DSN is
 * configured; currently empty/no-op in every environment).
 */
// Dev-only relaxations: React's dev-mode debugging (not production --
// "React will never use eval() in production mode") needs 'unsafe-eval',
// and Turbopack's HMR needs a ws: connection allowed. Neither applies
// once NODE_ENV is production, so the shipped policy stays strict.
const isDev = process.env.NODE_ENV !== "production";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io${isDev ? " ws://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // Silent unless SENTRY_AUTH_TOKEN is set (CI/production release
  // uploads) — a local dev build without Sentry configured stays quiet
  // rather than warning on every run.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source maps are uploaded to Sentry but not shipped to the client —
  // readable stack traces in Sentry without exposing source publicly.
  widenClientFileUpload: true,
  // Turbopack (this project's build engine, Blueprint §17) doesn't
  // support the older disableLogger option's webpack-based tree-shaking;
  // this is the currently-supported equivalent.
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
