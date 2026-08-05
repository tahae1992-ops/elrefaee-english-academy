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
import { PendingReviewsCard } from "@/components/dashboard/pending-reviews-card";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";
import { createGetXpBalanceUseCase } from "@/composition-root";

/**
 * Dashboard Shell (doc 09 §5.3 / doc 08 §3.4). The auth guard and the
 * displayName/email this page needs both already ran in
 * (app)/layout.tsx via the same `getCurrentUserWithDashboardData()`
 * call — React.cache dedupes it, so this is not a second query.
 *
 * streak/weekly-goal/recent-activity/recommended-lesson/course-progress
 * are still genuinely zero/empty for every current user: streaks are
 * Blueprint's E3 Gamification epic (not built here — only the XP ledger
 * this slice needs was), and no course/enrollment data exists until
 * Course Catalog ships. Rendered as designed empty/zero states, never
 * fabricated numbers. CEFR level, XP, and pending reviews are real and
 * live — XP from the Review Engine slice's `engagement.xp_balances`,
 * pending reviews from its `learning.vocabulary_review_state`.
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

  const xp = await createGetXpBalanceUseCase().execute(current.userId);

  return <DashboardContent userId={current.userId} currentLevel={current.dashboardData.currentLevel} xp={xp} />;
}

function DashboardContent({ userId, currentLevel, xp }: { userId: string; currentLevel: CefrLevel | null; xp: number }) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <StreakXpStrip streakDays={0} xp={xp} />
      <h1 className="sr-only">{t("pageTitle")}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <ContinueLearningCard currentLevel={currentLevel} />
        <CefrLevelCard currentLevel={currentLevel} />
        <PendingReviewsCard userId={userId} />
        <WeeklyGoalCard />
        <RecommendedLessonCard currentLevel={currentLevel} />
        <RecentActivityCard />
        <CourseProgressSection />
      </div>
    </div>
  );
}
