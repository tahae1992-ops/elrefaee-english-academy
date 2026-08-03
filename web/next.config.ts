import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
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
