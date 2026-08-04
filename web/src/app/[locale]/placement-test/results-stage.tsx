"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import type { PlacementScore } from "@/modules/assessment/interface/types";

const LEVEL_LABEL: Record<string, string> = {
  pre_a1: "Pre-A1",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};

export function ResultsStage({ result }: { result: PlacementScore }) {
  const t = useTranslations("PlacementTest.results");
  const router = useRouter();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="rounded-md bg-accent p-6 text-center text-accent-foreground">
          <p className="font-display text-3xl font-bold">
            {t("overallLevel", { level: LEVEL_LABEL[result.overallLevel] })}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {t("skillBreakdown")}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.skillLevels).map(([skill, level]) => (
              <Badge key={skill} variant="secondary">
                {skill}: {LEVEL_LABEL[level]}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {t("learningPathTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("learningPathPlaceholder", { level: LEVEL_LABEL[result.overallLevel] })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/courses">{t("viewCourse")}</Link>
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
            {t("goToDashboard")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
