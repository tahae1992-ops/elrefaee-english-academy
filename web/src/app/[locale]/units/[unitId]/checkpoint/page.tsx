import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetUnitDetailUseCase } from "@/composition-root";
import { gateCheckpointAccess } from "@/lib/gate-checkpoint-access";
import { Logo } from "@/components/logo";
import { CheckpointQuizFlow } from "./checkpoint-quiz-flow";

/**
 * doc 08 §3.9 Quiz — "a contained flow" (no app chrome), same pattern
 * as Placement Test/Lesson View/Review. Access is re-checked
 * server-side (SRS FR-04's AC extended to the checkpoint: direct
 * navigation must be denied exactly like a hidden link would be, not
 * just client-side-gated).
 */
export default async function UnitCheckpointPage({
  params,
}: {
  params: Promise<{ unitId: string; locale: string }>;
}) {
  const { unitId, locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  let unitDetail;
  try {
    unitDetail = await createGetUnitDetailUseCase().execute(unitId);
  } catch {
    redirect({ href: "/courses", locale });
    return;
  }

  const gate = await gateCheckpointAccess(unitId, current.userId);
  if (!gate.ok) {
    redirect({ href: `/courses/${unitDetail.course.id}/units/${unitId}`, locale });
    return;
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-center border-b border-border px-4">
        <Logo variant="mark" className="h-6 w-6" />
      </header>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <CheckpointQuizFlow unitId={unitId} courseId={unitDetail.course.id} unitTitle={unitDetail.unit.title} />
      </div>
    </main>
  );
}
