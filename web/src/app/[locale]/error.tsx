"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * Segment-level error boundary for everything rendered under
 * `[locale]` -- in this app's structure that's effectively "every
 * page," since there's no separate root layout above it. Next.js
 * catches these before Sentry ever sees them (same as
 * `global-error.tsx`), so capture is manual, in a `useEffect`.
 *
 * Safe to use next-intl/the app's own `Link` here (unlike
 * `global-error.tsx`): an error boundary only replaces the *page*
 * segment, not the layout above it -- `[locale]/layout.tsx`'s
 * `NextIntlClientProvider` stays mounted regardless of what broke
 * inside the page itself.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>{t("tryAgain")}</Button>
        <Button asChild variant="outline">
          <Link href="/">{t("homeLink")}</Link>
        </Button>
      </div>
    </main>
  );
}
