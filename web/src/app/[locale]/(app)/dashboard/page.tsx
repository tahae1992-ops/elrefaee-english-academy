import { useTranslations } from "next-intl";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import type { CefrLevel } from "@/modules/identity/interface/current-user";
import { StreakXpStrip } from "@/components/dashboard/streak-xp-strip";
import { ContinueLearningCard } from "@/components/dashboard/continue-learning-card";
import { CefrLevelCard } from "@/components/dashboard/cefr-level-card";
import { WeeklyGoalCard } from "@/components/dashboard/weekly-goal-card";
import { RecommendedLessonCard } from "@/components/dashboard/recommended-lesson-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { CourseProgressSection } from "@/components/dashboard/course-progress-section";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";

/**
 * Dashboard Shell (doc 09 §5.3 / doc 08 §3.4). The auth guard and the
 * displayName/email this page needs both already ran in
 * (app)/layout.tsx via the same `getCurrentUserWithDashboardData()`
 * call — React.cache dedupes it, so this is not a second query.
 *
 * XP/streak/weekly-goal/recent-activity/recommended-lesson/course-
 * progress are all genuinely zero for every current user: no
 * `engagement`/gamification schema exists yet (Blueprint's E3 epic,
 * a later sprint), and no course/enrollment data exists until Course
 * Catalog ships. Rendered as designed empty/zero states, never
 * fabricated numbers — CEFR level is the one real field
 * (`user_profiles.current_level`), null until the Placement Test slice
 * lands.
 */
export default async function DashboardPage() {
  let current;
  try {
    current = await getCurrentUserWithDashboardData();
  } catch {
    return (
      <div className="p-4 md:p-8">
        <WidgetsErrorState />
      </div>
    );
  }

  // (app)/layout.tsx already redirects when this is null — reaching
  // here with no user means the redirect is still in flight.
  if (!current) {
    return null;
  }

  return <DashboardContent currentLevel={current.dashboardData.currentLevel} />;
}

function DashboardContent({ currentLevel }: { currentLevel: CefrLevel | null }) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <StreakXpStrip streakDays={0} xp={0} />
      <h1 className="sr-only">{t("pageTitle")}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <ContinueLearningCard hasStartedLearning={false} />
        <CefrLevelCard currentLevel={currentLevel} />
        <WeeklyGoalCard />
        <RecommendedLessonCard />
        <RecentActivityCard />
        <CourseProgressSection />
      </div>
    </div>
  );
}
