"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { FinalizeCertificationAttemptResult } from "@/modules/assessment/interface/types";
import { CertificateIssuedDialog } from "@/components/certificates/certificate-issued-dialog";

/**
 * Wireframe §3.10: the celebratory issuance dialog only shows once,
 * right when a *new* certificate is actually issued -- a passing
 * result on a level the learner already holds a certificate for
 * (re-certification policy, see issue-certificate.use-case.ts) gets
 * a calmer "already certified" message instead, not a repeat
 * celebration.
 */
export function CertificationExamResults({
  result,
  courseId,
  courseTitle,
}: {
  result: FinalizeCertificationAttemptResult;
  courseId: string;
  courseTitle: string;
}) {
  const t = useTranslations("Exam.results");
  const [dialogOpen, setDialogOpen] = useState(result.certificate !== null);

  return (
    <>
      {result.certificate && (
        <CertificateIssuedDialog open={dialogOpen} onOpenChange={setDialogOpen} certificateId={result.certificate.id} />
      )}

      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          {result.passed ? (
            <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
          ) : (
            <XCircle className="size-12 text-destructive" aria-hidden="true" />
          )}

          <div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{result.passed ? t("passedTitle") : t("failedTitle")}</h1>
            <p className="text-sm text-muted-foreground">{courseTitle}</p>
          </div>

          <p className="font-display text-3xl font-bold">{t("scorePercent", { percent: result.scorePercent })}</p>

          <div className="flex w-full flex-col gap-2 rounded-md border border-border p-3 text-start">
            <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">{t("skillBreakdown")}</p>
            {Object.entries(result.skillBreakdown).map(([skill, breakdown]) => (
              <div key={skill} className="flex items-center justify-between text-sm">
                <span className="capitalize">{skill}</span>
                <span className={cn("font-medium", breakdown.correct === breakdown.total ? "text-success" : "text-muted-foreground")}>
                  {breakdown.correct}/{breakdown.total}
                </span>
              </div>
            ))}
          </div>

          {result.pendingReviewCount > 0 && <p className="text-xs text-muted-foreground">{t("pendingReview", { count: result.pendingReviewCount })}</p>}

          {result.passed && !result.certificate && <p className="text-sm text-muted-foreground">{t("alreadyCertified")}</p>}
          {!result.passed && <p className="text-sm text-muted-foreground">{t("cooldownHint")}</p>}

          <Button asChild variant="outline" className="w-full">
            <Link href={`/courses/${courseId}`}>{t("backToCourse")}</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
