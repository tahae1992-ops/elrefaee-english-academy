import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";

/**
 * Would render a grid of enrolled-course progress cards; empty for
 * every current user since neither enrollment nor Course Catalog
 * (the next roadmap slice) exist yet.
 */
export function CourseProgressSection() {
  const t = useTranslations("Dashboard.courseProgress");

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")} />
      </CardContent>
    </Card>
  );
}
