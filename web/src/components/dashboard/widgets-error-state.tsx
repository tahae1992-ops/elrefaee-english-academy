"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Doc 09 §5.3: "error — per-widget inline retry, never full-page."
 * Rendered in place of the widget grid when GetDashboardDataUseCase
 * itself fails — the nav chrome (already resolved by the layout) stays
 * up, only the data-dependent content degrades.
 */
export function WidgetsErrorState({ namespace = "Dashboard.error" }: { namespace?: string }) {
  const t = useTranslations(namespace);

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
        <p className="text-sm font-medium text-destructive">{t("title")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{t("description")}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          {t("retry")}
        </Button>
      </CardContent>
    </Card>
  );
}
