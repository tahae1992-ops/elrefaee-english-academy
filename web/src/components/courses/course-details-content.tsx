import { useTranslations } from "next-intl";
import { Award, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ProgressRing } from "@/components/courses/progress-ring";
import { cn } from "@/lib/utils";
import type { CourseProgressSnapshot } from "@/lib/resolve-course-progress";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

export function CourseDetailsContent({
  snapshot,
  certificationState,
  certificateId,
}: {
  snapshot: CourseProgressSnapshot;
  certificationState: "locked" | "available" | "certified";
  certificateId: string | null;
}) {
  const t = useTranslations("CourseDetails");
  const { courseDetail, lessonsByUnit, statusByLesson, unitAccess, resumeTarget, lessonsForCourse } = snapshot;

  const totalLessons = lessonsForCourse.length;
  const completedLessons = [...statusByLesson.values()].filter((status) => status === "completed").length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const sortedUnits = [...courseDetail.units].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:items-center sm:text-start">
          <ProgressRing percent={progressPercent} label={t("progressLabel", { percent: progressPercent })} />
          <div className="flex-1">
            <Badge variant="outline" className="mb-1">
              {LEVEL_LABEL[courseDetail.course.cefrLevel]}
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{courseDetail.course.title}</h1>
            <p className="text-sm text-muted-foreground">{courseDetail.course.description}</p>
          </div>
          {resumeTarget ? (
            <Button asChild className="w-full shrink-0 sm:w-auto">
              <Link href={`/lessons/${resumeTarget.lessonId}`}>
                {completedLessons > 0 ? t("continueCta") : t("startCta")}
              </Link>
            </Button>
          ) : (
            totalLessons > 0 && <Badge className="shrink-0">{t("courseComplete")}</Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {sortedUnits.map((unit) => {
          const access = unitAccess.get(unit.id) ?? "locked";
          const lessons = [...(lessonsByUnit.get(unit.id) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
          const completedInUnit = lessons.filter((lesson) => statusByLesson.get(lesson.id) === "completed").length;
          const isLocked = access === "locked";

          const card = (
            <Card className={cn("gap-2", isLocked && "opacity-60")}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    {t("unitLabel", { number: unit.orderIndex })}
                  </p>
                  <p className="font-display text-base font-bold">{unit.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("lessonCount", { completed: completedInUnit, total: lessons.length })}
                  </p>
                </div>
                {access === "completed" && <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />}
                {access === "in_progress" && <Badge variant="outline">{t("unitInProgress")}</Badge>}
                {isLocked && <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              </CardContent>
            </Card>
          );

          return isLocked ? (
            <div key={unit.id}>{card}</div>
          ) : (
            <Link key={unit.id} href={`/courses/${courseDetail.course.id}/units/${unit.id}`} className="block">
              {card}
            </Link>
          );
        })}
      </div>

      {/* Wireframe §2 site map: CourseDetails -->|level end| Exam. EDD §14: the level-end summative assessment is the same bar as completing the level -- available only once every unit above is completed. */}
      {certificationState === "certified" && certificateId ? (
        <Link href={`/certificates/${certificateId}`}>
          <Card className="gap-2 border-accent/40 bg-accent/10">
            <CardContent className="flex items-center gap-3 py-4">
              <Award className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t("certification.title")}</p>
                <p className="text-xs text-muted-foreground">{t("certification.certified")}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : certificationState === "available" ? (
        <Card className="gap-2 border-primary/40 bg-accent">
          <CardContent className="flex items-center gap-3 py-4">
            <Award className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("certification.title")}</p>
              <p className="text-xs text-muted-foreground">{t("certification.available")}</p>
            </div>
            <Button asChild size="sm">
              <Link href={`/exams/${courseDetail.course.id}/certification`}>{t("certification.start")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-2 opacity-60">
          <CardContent className="flex items-center gap-3 py-4">
            <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{t("certification.title")}</p>
              <p className="text-xs text-muted-foreground">{t("certification.locked")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
