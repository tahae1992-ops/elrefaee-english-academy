import { useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, Repeat, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stat {
  icon: typeof BookOpen;
  value: number;
  labelKey: "lessonsCompleted" | "exercisesCorrect" | "reviewsCompleted" | "vocabularyMastered";
}

/**
 * "Implement progress statistics" + Dashboard display requirement.
 * Live-computed from real tables (see resolve-gamification-snapshot.ts
 * for the disclosed simplification against the full precomputed-CQRS
 * design API Spec §6.10 anticipates at scale).
 */
export function ProgressStatsCard({
  lessonsCompleted,
  exercisesCorrect,
  reviewsCompleted,
  vocabularyMastered,
}: {
  lessonsCompleted: number;
  exercisesCorrect: number;
  reviewsCompleted: number;
  vocabularyMastered: number;
}) {
  const t = useTranslations("Dashboard.progressStats");

  const stats: Stat[] = [
    { icon: BookOpen, value: lessonsCompleted, labelKey: "lessonsCompleted" },
    { icon: CheckCircle2, value: exercisesCorrect, labelKey: "exercisesCorrect" },
    { icon: Repeat, value: reviewsCompleted, labelKey: "reviewsCompleted" },
    { icon: Sparkles, value: vocabularyMastered, labelKey: "vocabularyMastered" },
  ];

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, labelKey }) => (
            <li key={labelKey} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="size-5 text-info" aria-hidden="true" />
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
