import { useTranslations } from "next-intl";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createListCoursesUseCase } from "@/composition-root";
import { CourseCatalog } from "@/components/courses/course-catalog";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";
import type { CourseListItem } from "@/modules/curriculum/interface/types";

/**
 * Course Catalog (doc 08 §4.7 / doc 09 §6's compact-treatment table) —
 * lives inside the (app) shell, same auth guard/nav as Dashboard. Data
 * fetch mirrors Dashboard's pattern: read directly through the
 * composition root in the Server Component, not a client-side fetch to
 * the module's own REST route (that route exists for the documented
 * API surface / future clients, per API Spec §6.3).
 */
export default async function CoursesPage() {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return null;
  }

  let courses;
  try {
    courses = await createListCoursesUseCase().execute(current.dashboardData.currentLevel);
  } catch {
    return (
      <div className="p-4 md:p-8">
        <WidgetsErrorState namespace="Courses.error" />
      </div>
    );
  }

  return <CoursesContent courses={courses} hasLevel={current.dashboardData.currentLevel !== null} />;
}

function CoursesContent({
  courses,
  hasLevel,
}: {
  courses: CourseListItem[];
  hasLevel: boolean;
}) {
  const t = useTranslations("Courses");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <CourseCatalog courses={courses} hasLevel={hasLevel} />
    </div>
  );
}
