"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { CheckpointScore } from "@/modules/assessment/interface/types";

/**
 * FR-06's exception flow: "surfaces exactly which skill(s) fell below
 * threshold and recommends specific remediation lessons, not a generic
 * 'try again'." The per-skill breakdown itself is real (every skill's
 * correct/total, from the same scoring the pass/fail gate used) — the
 * one deliberate simplification is the remediation pointer, which
 * routes back to the unit's own lesson list rather than a specific
 * lesson (no lesson-to-skill mapping exists yet to make that precise;
 * disclosed here rather than faked).
 */
export function CheckpointResults({
  result,
  unitId,
  courseId,
  unitTitle,
  onRetry,
}: {
  result: CheckpointScore;
  unitId: string;
  courseId: string;
  unitTitle: string;
  onRetry: () => void;
}) {
  const t = useTranslations("Quiz.results");

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        {result.passed ? (
          <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        ) : (
          <XCircle className="size-12 text-destructive" aria-hidden="true" />
        )}

        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">
            {result.passed ? t("passedTitle") : t("failedTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("unitLabel", { unit: unitTitle })}</p>
        </div>

        <p className="font-display text-3xl font-bold">{t("scorePercent", { percent: result.scorePercent })}</p>

        <div className="flex w-full flex-col gap-2 rounded-md border border-border p-3 text-start">
          <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">{t("skillBreakdown")}</p>
          {Object.entries(result.skillBreakdown).map(([skill, breakdown]) => (
            <div key={skill} className="flex items-center justify-between text-sm">
              <span className="capitalize">{skill}</span>
              <span
                className={cn(
                  "font-medium",
                  breakdown.correct === breakdown.total ? "text-success" : "text-muted-foreground",
                )}
              >
                {breakdown.correct}/{breakdown.total}
              </span>
            </div>
          ))}
        </div>

        {!result.passed && <p className="text-sm text-muted-foreground">{t("remediationHint")}</p>}

        <div className="flex w-full flex-col gap-2">
          {result.passed ? (
            <Button asChild className="w-full">
              <Link href={`/courses/${courseId}/units/${unitId}`}>{t("continue")}</Link>
            </Button>
          ) : (
            <Button className="w-full" onClick={onRetry}>
              {t("tryAgain")}
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href={`/courses/${courseId}/units/${unitId}`}>{t("backToUnit")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
