import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function WeeklyGoalCard() {
  const t = useTranslations("Dashboard.weeklyGoal");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          <Target className="size-4" aria-hidden="true" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-display text-3xl font-bold">{t("noGoal")}</p>
        <Progress value={0} aria-label={t("title")} />
        <p className="text-sm text-muted-foreground">{t("noGoalHint")}</p>
      </CardContent>
    </Card>
  );
}
