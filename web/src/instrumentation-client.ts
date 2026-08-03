import * as Sentry from "@sentry/nextjs";

/**
 * Client-side observability bootstrap (Next.js's native
 * instrumentation-client.ts convention). A missing DSN makes this a
 * no-op — safe for local development without a configured Sentry project.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session replay is deliberately not enabled yet — it's a real privacy
  // surface (captures user interaction), and this project takes privacy
  // seriously enough (Blueprint §15/SRS §12.7) that it should be a
  // deliberate future decision, not a default turned on by scaffolding.
});

// Required by the SDK to instrument client-side route transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
