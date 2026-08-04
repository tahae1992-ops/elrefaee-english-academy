import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { CefrLevel } from "@/modules/identity/interface/current-user";

export function RecommendedLessonCard({ currentLevel }: { currentLevel: CefrLevel | null }) {
  const t = useTranslations("Dashboard.recommendedLesson");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Lightbulb}
          title={t("emptyTitle")}
          description={currentLevel ? t("emptyDescriptionPlaced") : t("emptyDescription")}
        />
      </CardContent>
    </Card>
  );
}
