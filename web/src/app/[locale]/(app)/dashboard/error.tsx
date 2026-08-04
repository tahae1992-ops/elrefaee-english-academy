"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Last-resort boundary for an unexpected render error — the expected
 * failure mode (the dashboard-data query itself throwing) is already
 * caught inline in page.tsx and shown as a WidgetsErrorState so the
 * nav chrome survives; this only fires for something page.tsx's own
 * try/catch didn't anticipate.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium text-destructive">Something went wrong.</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        We couldn&apos;t load your dashboard. Please try again.
      </p>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
