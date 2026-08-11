import { getTranslations } from "next-intl/server";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetTeacherRosterUseCase } from "@/composition-root";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { StudentRosterEntry } from "@/modules/instruction/interface/types";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

/**
 * Phase 21, Goal 2's teacher roster. Every field here comes straight
 * from GetTeacherRosterUseCase's real query (progress %, completed
 * lessons, average score, last activity) — no placeholder/decorative
 * numbers; an empty roster or a student with no grades yet shows an
 * explicit "no data" state instead of a fabricated 0%.
 */
export default async function TeacherRosterPage() {
  // Layout already redirects if unauthenticated/unauthorized — safe to assume both here.
  const current = (await getCurrentUserWithDashboardData())!;
  const roster = await createGetTeacherRosterUseCase().execute(current.userId);
  const t = await getTranslations("Teacher.roster");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {roster.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{t("noStudents")}</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {roster.map((entry) => (
            <RosterRow key={entry.studentId} entry={entry} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

type RosterTranslator = Awaited<ReturnType<typeof getTranslations>>;

function RosterRow({ entry, t }: { entry: StudentRosterEntry; t: RosterTranslator }) {
  return (
    <Link href={`/teacher/students/${entry.studentId}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex flex-col gap-1">
            <p className="font-medium">{entry.displayName}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{entry.currentLevel ? LEVEL_LABEL[entry.currentLevel] : t("noLevel")}</Badge>
              <span>{t("lessonsCompleted", { count: entry.completedLessonsCount })}</span>
              {entry.averageScorePercentage !== null && <span>{t("averageScore", { percent: entry.averageScorePercentage })}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <Badge variant={entry.status === "active" ? "default" : "outline"}>
              {entry.status === "active" ? t("statusActive") : t("statusInactive")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {entry.progressPercentage !== null ? t("progress", { percent: entry.progressPercentage }) : t("noData")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
