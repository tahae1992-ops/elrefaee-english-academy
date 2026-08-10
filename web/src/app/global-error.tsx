"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import "./globals.css";

/**
 * Sentry's own documented pattern for the App Router: `global-error.tsx`
 * is the last-resort boundary for errors thrown by the root layout
 * itself, and (same constraint as `global-not-found.tsx`, see that
 * file's comment) this app's real root layout is `[locale]/layout.tsx`
 * -- so this file brings its own minimal `<html>`/`<body>` rather than
 * relying on a layout that may be exactly what failed. Kept
 * deliberately simple (no next-intl, no design-system components
 * beyond the dependency-free Logo) so this page itself has as little
 * as possible left to fail.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center bg-background text-foreground">
        <Logo />
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            We&apos;ve been notified and are looking into it. Try reloading the page.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
