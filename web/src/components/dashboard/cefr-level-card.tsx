import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CefrLevel } from "@/modules/identity/interface/current-user";

const LEVEL_ORDER: CefrLevel[] = ["pre_a1", "a1", "a2", "b1", "b2", "c1"];
const LEVEL_LABEL: Record<CefrLevel, string> = {
  pre_a1: "Pre-A1",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};

export function CefrLevelCard({ currentLevel }: { currentLevel: CefrLevel | null }) {
  const t = useTranslations("Dashboard.cefrLevel");

  const progressPercent = currentLevel
    ? ((LEVEL_ORDER.indexOf(currentLevel) + 1) / LEVEL_ORDER.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          <GraduationCap className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-display text-3xl font-bold">
          {currentLevel ? LEVEL_LABEL[currentLevel] : t("notAssessed")}
        </p>
        <Progress value={progressPercent} aria-label={t("title")} />
        <p className="text-sm text-muted-foreground">
          {currentLevel ? t("assessedHint") : t("notAssessedHint")}
        </p>
      </CardContent>
    </Card>
  );
}
