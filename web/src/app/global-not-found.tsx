import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import "./globals.css";

/**
 * `global-not-found.tsx` bypasses every layout (including
 * `[locale]/layout.tsx`) -- Next's own routing docs call this app's
 * shape out by name: a root dynamic segment (`[locale]`, not a
 * catch-all) can't compose a normal nested `not-found.tsx` for URLs
 * that don't match any route at all, only for `notFound()` thrown
 * from within an already-matched page. This is that fallback, so it
 * brings its own full `<html>`/`<body>` and styles rather than relying
 * on the locale layout's. No next-intl context exists at this
 * boundary, so it renders in English only, matching Next's own
 * documented examples for this file.
 */
export const metadata: Metadata = {
  title: "Not Found · ERA",
  description: "The page you're looking for doesn't exist or may have moved.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center bg-background text-foreground">
        <Logo />
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-6xl font-bold tracking-[-0.02em] text-primary">404</p>
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">Page not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Back to ERA
        </Link>
      </body>
    </html>
  );
}
