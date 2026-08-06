import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronLeft, CircleDot, ClipboardCheck, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PublishedLessonSummary, PublishedUnit } from "@/modules/curriculum/interface/types";
import type { LessonProgressStatus, UnitAccessState } from "@/modules/learning/interface/types";

export function UnitContent({
  courseId,
  unit,
  lessons,
  statusByLesson,
  unitAccess,
}: {
  courseId: string;
  unit: Pick<PublishedUnit, "id" | "title" | "description" | "orderIndex">;
  lessons: PublishedLessonSummary[];
  statusByLesson: Map<string, LessonProgressStatus>;
  unitAccess: UnitAccessState;
}) {
  const t = useTranslations("Unit");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <Link href={`/courses/${courseId}`} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" />
          {t("backToCourse")}
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{unit.title}</h1>
        <p className="text-sm text-muted-foreground">{unit.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        {lessons.map((lesson) => {
          const status = statusByLesson.get(lesson.id) ?? "not_started";
          return (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card className="gap-2 transition-opacity hover:opacity-90">
                <CardContent className="flex items-center gap-3 py-3">
                  {status === "completed" && <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />}
                  {status === "in_progress" && <CircleDot className="size-5 shrink-0 text-primary" aria-hidden="true" />}
                  {status === "not_started" && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">
                      {lesson.orderIndex}
                    </span>
                  )}
                  <span className="text-sm font-medium">{lesson.title}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* doc 08 §4.9: "checkpoint stays visibly present-but-locked (not hidden)" — now a real, gating mastery checkpoint (SRS FR-06/FR-08), not a placeholder. */}
      {unitAccess === "checkpoint_available" ? (
        <Card className="gap-2 border-primary/40 bg-accent">
          <CardContent className="flex items-center gap-3 py-3">
            <ClipboardCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("checkpoint.title")}</p>
              <p className="text-xs text-muted-foreground">{t("checkpoint.available")}</p>
            </div>
            <Button asChild size="sm">
              <Link href={`/units/${unit.id}/checkpoint`}>{t("checkpoint.start")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-2 opacity-60">
          <CardContent className="flex items-center gap-3 py-3">
            {unitAccess === "completed" ? (
              <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-medium">{t("checkpoint.title")}</p>
              <p className="text-xs text-muted-foreground">
                {unitAccess === "completed" ? t("checkpoint.unitComplete") : t("checkpoint.comingSoon")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
