import type { Instrumentation } from "next";

/**
 * Server/edge-runtime observability bootstrap (Next.js's native
 * instrumentation.ts convention). Runs once per server instance before it
 * starts handling requests — SRS §13.6/§21's monitoring requirement,
 * wired at the platform level so no later module has to think about it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      // A missing DSN (e.g. local dev without Sentry configured) makes
      // this a no-op, not an error — Sentry's SDK handles that natively.
      tracesSampleRate: 0.1,
      // Correlation IDs (SAD §21) come from Sentry's own automatic
      // request tracing; no extra wiring needed for the server runtime.
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

// Reports errors from Server Components / Route Handlers that Next.js
// itself catches — the server-side half of SRS §22's error-handling
// layering (the API error envelope, SRS §6.5, is a separate, deliberate
// translation boundary; this hook is purely for observability).
export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
