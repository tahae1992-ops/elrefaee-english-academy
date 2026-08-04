import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Would render a grid of enrolled-course progress cards; empty for
 * every current user since enrollment (`learning.enrollments`, Phase 6)
 * doesn't exist yet, even though the Course Catalog itself now does.
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
        <EmptyState
          icon={BookOpen}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">{t("browseCourses")}</Link>
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
