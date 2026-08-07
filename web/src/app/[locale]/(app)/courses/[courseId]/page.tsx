import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createEnterCourseUseCase, createListCertificatesUseCase } from "@/composition-root";
import { resolveCourseProgress } from "@/lib/resolve-course-progress";
import { computeCourseAccess, CourseNotFoundError } from "@/modules/curriculum/interface/types";
import { WidgetsErrorState } from "@/components/dashboard/widgets-error-state";
import { CourseDetailsContent } from "@/components/courses/course-details-content";

/** doc 08 §4.8 / doc 09 §6 "Course Details" — progress ring + unit list, Continue CTA always resumes actual position. */
export default async function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) return null;

  let snapshot;
  try {
    snapshot = await resolveCourseProgress(courseId, current.userId);
  } catch (error) {
    if (error instanceof CourseNotFoundError) notFound();
    return (
      <div className="p-4 md:p-8">
        <WidgetsErrorState namespace="CourseDetails.error" />
      </div>
    );
  }

  const courseAccess = computeCourseAccess(snapshot.courseDetail.course.cefrLevel, current.dashboardData.currentLevel);
  const courseUnlocked = courseAccess.state === "current" || courseAccess.state === "unlocked";

  if (!courseUnlocked) {
    return <LockedCourseState />;
  }

  // DDD §3.5: entering a course get-or-creates the learner's enrollment.
  await createEnterCourseUseCase().execute({
    userId: current.userId,
    academyId: snapshot.courseDetail.course.academyId,
    courseId,
  });

  const allUnitsCompleted = snapshot.courseDetail.units.every((unit) => snapshot.unitAccess.get(unit.id) === "completed");
  const certificates = await createListCertificatesUseCase().execute(current.userId);
  const existingCertificate = certificates.find((certificate) => certificate.cefrLevel === snapshot.courseDetail.course.cefrLevel);

  const certificationState: "locked" | "available" | "certified" = existingCertificate ? "certified" : allUnitsCompleted ? "available" : "locked";

  return <CourseDetailsContent snapshot={snapshot} certificationState={certificationState} certificateId={existingCertificate?.id ?? null} />;
}

function LockedCourseState() {
  const t = useTranslations("CourseDetails");

  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center md:p-8">
      <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{t("locked.title")}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{t("locked.description")}</p>
    </div>
  );
}
