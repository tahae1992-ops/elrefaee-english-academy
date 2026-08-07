import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetCourseDetailUseCase } from "@/composition-root";
import { gateCertificationAccess } from "@/lib/gate-certification-access";
import { Logo } from "@/components/logo";
import { CertificationExamFlow } from "./certification-exam-flow";

/**
 * Wireframe §2 site map: CourseDetails -->|level end| Exam -- a
 * contained flow (no app chrome), same pattern as the checkpoint
 * quiz and Placement Test. Access re-checked server-side (every unit
 * in the course must be complete) -- direct navigation is denied
 * exactly like a hidden link would be.
 */
export default async function CertificationExamPage({
  params,
}: {
  params: Promise<{ courseId: string; locale: string }>;
}) {
  const { courseId, locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  let courseDetail;
  try {
    courseDetail = await createGetCourseDetailUseCase().execute(courseId);
  } catch {
    redirect({ href: "/courses", locale });
    return;
  }

  const gate = await gateCertificationAccess(courseId, current.userId);
  if (!gate.ok) {
    redirect({ href: `/courses/${courseId}`, locale });
    return;
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-center border-b border-border px-4">
        <Logo variant="mark" className="h-6 w-6" />
      </header>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <CertificationExamFlow courseId={courseId} courseTitle={courseDetail.course.title} />
      </div>
    </main>
  );
}
