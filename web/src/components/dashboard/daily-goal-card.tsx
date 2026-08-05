import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/** "Implement daily goals" — today's earned XP against the learner's daily target (engagement.daily_goals, defaulted). Fed from the one Dashboard-level resolveGamificationSnapshot call (see dashboard/page.tsx) rather than querying again itself. */
export function DailyGoalCard({ goalXp, earnedTodayXp }: { goalXp: number; earnedTodayXp: number }) {
  const t = useTranslations("Dashboard.dailyGoal");
  const percent = goalXp > 0 ? Math.min(100, Math.round((earnedTodayXp / goalXp) * 100)) : 0;
  const reached = earnedTodayXp >= goalXp;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-info" aria-hidden="true" />
          <p className="text-sm font-medium">{t("progress", { earned: earnedTodayXp, goal: goalXp })}</p>
        </div>
        <Progress value={percent} aria-label={t("title")} />
        {reached && <p className="text-xs font-medium text-success">{t("reached")}</p>}
      </CardContent>
    </Card>
  );
}
