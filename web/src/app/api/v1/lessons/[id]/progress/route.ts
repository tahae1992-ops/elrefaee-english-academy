import { NextResponse } from "next/server";
import { createSaveLessonPositionUseCase, createRecordActivityEventUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleSaveLessonPosition } from "@/modules/learning/interface/save-lesson-position.controller";

// FR-05's Alternative Flow: persist exact block position on exit/navigation.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const gate = await gateLessonAccess(id, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleSaveLessonPosition(createSaveLessonPositionUseCase(), current.userId, id, body);

  // Phase 21, Goal 2: a real "reached this section" signal — fires for
  // the block the learner is moving *into*, only on a genuinely
  // successful save (so a validation failure doesn't record a phantom
  // view). Distinct event types for vocabulary/quiz sections
  // specifically, matching the spec's own event list, rather than one
  // generic "section_viewed" for everything.
  if (status === 200 && typeof body === "object" && body && "blockIndex" in body) {
    const blockIndex = (body as { blockIndex: number }).blockIndex;
    const block = gate.lesson.content.blocks[blockIndex];
    if (block) {
      const recordActivityEvent = createRecordActivityEventUseCase();
      await recordActivityEvent.execute({
        userId: current.userId,
        eventType: "section_viewed",
        lessonId: id,
        metadata: { blockIndex, blockType: block.type },
      });
      if (block.type === "vocabulary" || block.type === "wrap_up") {
        await recordActivityEvent.execute({
          userId: current.userId,
          eventType: "vocabulary_viewed",
          lessonId: id,
          metadata: { blockIndex },
        });
      }
      if (block.type === "quiz") {
        await recordActivityEvent.execute({
          userId: current.userId,
          eventType: "quiz_started",
          lessonId: id,
          metadata: { blockIndex },
        });
      }
    }
  }

  return NextResponse.json(responseBody, { status });
}
