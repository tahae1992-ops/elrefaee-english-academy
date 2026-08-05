import { useTranslations } from "next-intl";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import type { CefrLevel } from "@/modules/identity/interface/current-user";
import { StreakXpStrip } from "@/components/dashboard/streak-xp-strip";
import { ContinueLearningCard } from "@/components/dashboard/continue-learning-card";
import { CefrLevelCard } from "@/components/dashboard/cefr-level-card";
import { WeeklyGoalCard } from "@/components/dashboard/weekly-goal-card";
import { DailyGoalCard } from "@/components/dashboard/daily-goal-card";
import { RecommendedLessonCard } from "@/components/dashboard/recommended-lesson-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { CourseProgressSection } from "@/components/dashboard/course-progress-section";
import { PendingReviewsCard } from "@/components/dashboard/pending-reviews-card";
import { BadgesCard } from "@/components/dashboard/badges-card";
import { ProgressStatsCard } from "@/components/dashboard/progress-stats-card";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";
import { resolveGamificationSnapshot } from "@/lib/resolve-gamification-snapshot";
import type { GamificationSnapshot } from "@/lib/resolve-gamification-snapshot";

/**
 * Dashboard Shell (doc 09 §5.3 / doc 08 §3.4). The auth guard and the
 * displayName/email this page needs both already ran in
 * (app)/layout.tsx via the same `getCurrentUserWithDashboardData()`
 * call — React.cache dedupes it, so this is not a second query.
 *
 * weekly-goal/recent-activity/recommended-lesson/course-progress are
 * still genuinely empty for every current user: no course/enrollment
 * data exists until Course Catalog ships, and weekly (as opposed to
 * daily) goals are a separate, not-yet-requested feature. Rendered as
 * designed empty/zero states, never fabricated numbers. CEFR level,
 * and the whole Gamification snapshot (XP/level/streak/daily goal/
 * badges/progress stats) are real and live, fetched once here via
 * resolveGamificationSnapshot and passed down — every card below reads
 * from that one call rather than re-querying it.
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

  const gamification = await resolveGamificationSnapshot(current.userId, new Date());

  return <DashboardContent userId={current.userId} currentLevel={current.dashboardData.currentLevel} gamification={gamification} />;
}

function DashboardContent({
  userId,
  currentLevel,
  gamification,
}: {
  userId: string;
  currentLevel: CefrLevel | null;
  gamification: GamificationSnapshot;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <StreakXpStrip streakDays={gamification.streak.current} xp={gamification.xp.total} level={gamification.xp.level} />
      <h1 className="sr-only">{t("pageTitle")}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <ContinueLearningCard currentLevel={currentLevel} />
        <CefrLevelCard currentLevel={currentLevel} />
        <PendingReviewsCard userId={userId} />
        <DailyGoalCard goalXp={gamification.dailyGoal.goalXp} earnedTodayXp={gamification.dailyGoal.earnedTodayXp} />
        <WeeklyGoalCard />
        <RecommendedLessonCard currentLevel={currentLevel} />
        <RecentActivityCard />
        <BadgesCard badges={gamification.badges} />
        <ProgressStatsCard
          lessonsCompleted={gamification.stats.lessonsCompleted}
          exercisesCorrect={gamification.stats.exercisesCorrect}
          reviewsCompleted={gamification.stats.reviewsCompleted}
          vocabularyMastered={gamification.stats.vocabularyMastered}
        />
        <CourseProgressSection />
      </div>
    </div>
  );
}
