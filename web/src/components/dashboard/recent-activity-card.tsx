import { useTranslations } from "next-intl";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";

export function RecentActivityCard() {
  const t = useTranslations("Dashboard.recentActivity");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState icon={History} title={t("emptyTitle")} description={t("emptyDescription")} />
      </CardContent>
    </Card>
  );
}
