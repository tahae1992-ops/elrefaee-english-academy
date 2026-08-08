import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { CourseListItem } from "@/modules/curriculum/interface/types";

const LEVEL_LABEL: Record<CourseListItem["cefrLevel"], string> = {
  pre_a1: "Pre-A1",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};

/** Doc 08 §4.7: locked cards always show *why*, in visible text (never hover-only), never just a disabled card. */
export function CourseCard({ course }: { course: CourseListItem }) {
  const t = useTranslations("Courses");
  const isLocked = course.access.state === "locked" || course.access.state === "requires_placement";

  const card = (
    <Card className={cn("gap-3", !isLocked && "transition-opacity hover:opacity-90")}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          {/* No opacity dimming on this badge -- its label ("A1", "B2",
              etc.) is real text content, and WCAG 1.4.3's 4.5:1 applies
              regardless of how minor the text seems. The locked state
              is conveyed by the Lock icon (decorative, aria-hidden,
              only needs the lower 3:1 non-text threshold) and the
              explicit "why locked" text below, not by dimming. */}
          <Badge variant="outline" className="w-fit">
            {LEVEL_LABEL[course.cefrLevel]}
          </Badge>
          <CardTitle className="font-display text-lg">{course.title}</CardTitle>
        </div>
        {course.access.state === "current" && <Badge>{t("card.currentLevel")}</Badge>}
        {isLocked && <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription>{course.description}</CardDescription>
        {course.access.state === "locked" && (
          <p className="text-xs font-medium text-muted-foreground">
            {t("card.lockedReason", { level: LEVEL_LABEL[course.access.unlocksAfterLevel!] })}
          </p>
        )}
        {course.access.state === "requires_placement" && (
          <p className="text-xs font-medium text-muted-foreground">{t("card.requiresPlacementReason")}</p>
        )}
      </CardContent>
    </Card>
  );

  if (isLocked) return card;
  return <Link href={`/courses/${course.id}`}>{card}</Link>;
}
