import { getTranslations } from "next-intl/server";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetStudentDetailUseCase } from "@/composition-root";
import { redirect } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotAuthorizedForStudentError } from "@/modules/instruction/interface/types";
import type { RecentActivityEntry, RecentGradeEntry, TopicPerformance } from "@/modules/instruction/interface/types";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

/**
 * Phase 21, Goal 2's student detail drill-down. `isAssigned` is
 * checked server-side inside GetStudentDetailUseCase itself — not
 * re-derived here, and not something the UI can be tricked into
 * bypassing by visiting this URL directly with another student's id;
 * the layout above already confirmed the caller is a teacher, this
 * page's use-case confirms they're *this* student's teacher.
 */
export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string; locale: string }> }) {
  const { studentId, locale } = await params;
  const current = (await getCurrentUserWithDashboardData())!;
  const t = await getTranslations("Teacher.detail");

  let detail;
  try {
    detail = await createGetStudentDetailUseCase().execute(current.userId, studentId);
  } catch (error) {
    if (error instanceof NotAuthorizedForStudentError) {
      redirect({ href: "/teacher", locale });
      return;
    }
    throw error;
  }

  if (!detail) {
    redirect({ href: "/teacher", locale });
    return;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{detail.displayName}</h1>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary">{detail.currentLevel ? LEVEL_LABEL[detail.currentLevel] : t("noLevel")}</Badge>
          <span className="text-xs text-muted-foreground">
            {detail.lastActivityAt ? t("lastActive", { date: detail.lastActivityAt.toLocaleDateString() }) : t("noActivity")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("overallProgress")} value={detail.progressPercentage !== null ? `${detail.progressPercentage}%` : t("noData")} />
        <StatCard label={t("lessonsCompletedLabel")} value={`${detail.lessons.completed} / ${detail.lessons.total}`} />
        <StatCard label={t("inProgressLabel")} value={String(detail.lessons.inProgress)} />
        <StatCard
          label={t("averageScoreLabel")}
          value={detail.averageScorePercentage !== null ? `${detail.averageScorePercentage}%` : t("noData")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("lessonBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <span>{t("lessonsCompletedCount", { count: detail.lessons.completed })}</span>
          <span>{t("lessonsInProgressCount", { count: detail.lessons.inProgress })}</span>
          <span>{t("lessonsNotStartedCount", { count: detail.lessons.notStarted })}</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <TopicList title={t("weakAreas")} items={detail.weakAreas} emptyLabel={t("noData")} />
        <TopicList title={t("strongAreas")} items={detail.strongAreas} emptyLabel={t("noData")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recentGrades")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.recentGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noData")}</p>
          ) : (
            detail.recentGrades.map((grade, index) => <GradeRow key={index} grade={grade} t={t} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noData")}</p>
          ) : (
            detail.recentActivity.map((event, index) => <ActivityRow key={index} event={event} t={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TopicList({ title, items, emptyLabel }: { title: string; items: TopicPerformance[]; emptyLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div key={item.lessonId} className="flex items-center justify-between text-sm">
              <span>{item.lessonTitle}</span>
              <Badge variant="outline">{item.averagePercentage}%</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

type DetailTranslator = Awaited<ReturnType<typeof getTranslations>>;

function GradeRow({ grade, t }: { grade: RecentGradeEntry; t: DetailTranslator }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        {t(`gradeType.${grade.gradeType}`)} · {grade.createdAt.toLocaleDateString()}
      </span>
      <Badge variant="outline">
        {grade.score}/{grade.maxScore} ({grade.percentage}%)
      </Badge>
    </div>
  );
}

function ActivityRow({ event, t }: { event: RecentActivityEntry; t: DetailTranslator }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{t(`eventType.${event.eventType}`)}</span>
      <span className="text-xs text-muted-foreground">{event.createdAt.toLocaleString()}</span>
    </div>
  );
}
