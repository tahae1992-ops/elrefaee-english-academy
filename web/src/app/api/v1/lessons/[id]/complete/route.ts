import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdvanceEnrollmentUseCase,
  createCompleteLessonUseCase,
  createQueueVocabularyForReviewUseCase,
  createAwardXpUseCase,
  createRecordActivityEventUseCase,
  createRecordGradeUseCase,
  createDrizzleExerciseAttemptAdapter,
  createDrizzleActivityEventAdapter,
} from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleCompleteLesson } from "@/modules/learning/interface/complete-lesson.controller";
import { recordGamificationActivity } from "@/lib/record-gamification-activity";
import { deterministicEventId } from "@/lib/deterministic-event-id";
import { computeLessonCompletionGaps } from "@/lib/compute-lesson-completion-gaps";
import { XP_REWARDS } from "@/modules/engagement/interface/types";
import type { ClientLessonBlock } from "@/modules/curriculum/interface/types";

const completionRequestSchema = z.object({
  blockIndex: z.number().int().min(0),
  blockInteractions: z.record(z.string(), z.unknown()).default({}),
});

/**
 * API Spec §6.3: POST /lessons/{id}/complete (FR-05). The unit-advance
 * orchestration (does finishing this lesson complete its whole unit,
 * and if so, unlock/point the enrollment at the next one?) lives here
 * — needs both curriculum structure and learning progress, so it's
 * "other code," not either module's own logic, same pattern as the
 * Placement Test finalize route's identity write.
 *
 * Review Engine slice: FR-09's Main Flow step 1 ("lesson completion
 * auto-populates notebook entries") + EDD §5's wrap-up step queueing
 * target vocabulary/grammar chunks into spaced repetition. Also
 * cross-module orchestration for the same reason — `learning`'s
 * QueueVocabularyForReviewUseCase only knows vocabularyEntryIds, and
 * only this route already has the lesson's resolved wrap_up block
 * (via `gate.lesson`, curriculum's output).
 *
 * Gamification Engine slice: awards XP through the one AwardXpUseCase
 * (FR-18's "single domain service" requirement), idempotent per
 * (user, lesson) via a deterministic sourceEventId — revisiting an
 * already-completed lesson never re-awards. Also records the day's
 * activity (streak) and re-evaluates badge eligibility via
 * src/lib/record-gamification-activity.ts.
 */
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

  // Pre-A1 blueprint (Rev. 3) Rule 6: a lesson is only allowed to
  // complete once every block up to this point has a real
  // section_viewed event, every gradable exercise has a real attempt,
  // and every open-ended task has a submission — never on the client
  // simply calling this endpoint.
  const parsedForGate = completionRequestSchema.safeParse(body);
  if (!parsedForGate.success) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "Invalid request." }, { status: 400 });
  }
  const viewedBlockIndexes = new Set(await createDrizzleActivityEventAdapter().listViewedBlockIndexes(current.userId, id));
  const gradableExerciseIds = gate.lesson.content.blocks.flatMap((block) =>
    block.type === "controlled_practice" || block.type === "quiz" ? block.exercises.map((ref) => ref.id) : [],
  );
  const attemptedExerciseIds = new Set(
    (await createDrizzleExerciseAttemptAdapter().getLatestCorrectnessForExercises(current.userId, gradableExerciseIds)).keys(),
  );
  const gaps = computeLessonCompletionGaps(
    gate.lesson.content.blocks,
    parsedForGate.data.blockIndex,
    viewedBlockIndexes,
    attemptedExerciseIds,
    parsedForGate.data.blockInteractions as Record<number, unknown>,
  );
  if (gaps.length > 0) {
    return NextResponse.json(
      { error: "LESSON_NOT_READY", message: "Finish the remaining sections before completing this lesson.", gaps },
      { status: 400 },
    );
  }

  const { status, body: responseBody } = await handleCompleteLesson(createCompleteLessonUseCase(), current.userId, id, body);
  if (status !== 200) {
    return NextResponse.json(responseBody, { status });
  }

  const { lesson, snapshot } = gate;
  const now = new Date();

  // Phase 21, Goal 2: real, persistent lesson-completion signal for
  // the teacher activity timeline and student progress view.
  const recordActivityEvent = createRecordActivityEventUseCase();
  await recordActivityEvent.execute({ userId: current.userId, eventType: "lesson_completed", lessonId: id });

  // Phase 21 grading: quiz + lesson-level grades, computed from
  // server-authoritative attempt correctness (never the client's own
  // blockInteractions submission) via getLatestCorrectnessForExercises.
  const gradableBlocks = lesson.content.blocks.filter(
    (block): block is Extract<ClientLessonBlock, { type: "controlled_practice" | "quiz" }> =>
      block.type === "controlled_practice" || block.type === "quiz",
  );
  if (gradableBlocks.length > 0) {
    const allExerciseIds = gradableBlocks.flatMap((block) => block.exercises.map((ref) => ref.id));
    const correctness = await createDrizzleExerciseAttemptAdapter().getLatestCorrectnessForExercises(current.userId, allExerciseIds);
    const recordGrade = createRecordGradeUseCase();

    for (const block of gradableBlocks) {
      if (block.type !== "quiz") continue;
      const total = block.exercises.length;
      const correct = block.exercises.filter((ref) => correctness.get(ref.id) === true).length;
      await recordGrade.execute({ userId: current.userId, gradeType: "quiz", referenceId: id, lessonId: id, score: correct, maxScore: total });
      await recordActivityEvent.execute({ userId: current.userId, eventType: "quiz_completed", lessonId: id });
    }

    const lessonTotal = allExerciseIds.length;
    const lessonCorrect = allExerciseIds.filter((exerciseId) => correctness.get(exerciseId) === true).length;
    await recordGrade.execute({
      userId: current.userId,
      gradeType: "lesson",
      referenceId: id,
      lessonId: id,
      score: lessonCorrect,
      maxScore: lessonTotal,
    });
  }

  const wrapUpBlock = lesson.content.blocks.find((block) => block.type === "wrap_up");
  if (wrapUpBlock && wrapUpBlock.type === "wrap_up" && wrapUpBlock.targetVocabulary.length > 0) {
    await createQueueVocabularyForReviewUseCase().execute(
      current.userId,
      wrapUpBlock.targetVocabulary.map((ref) => ref.id),
      now,
    );
  }

  // Gamification Engine slice: FR-18's "XP awarded per completed lesson."
  // Deterministic sourceEventId per (user, lesson) — revisiting an
  // already-completed lesson (the UI allows this) never re-awards XP.
  const xpAward = await createAwardXpUseCase().execute({
    userId: current.userId,
    amount: XP_REWARDS.lessonCompleted,
    sourceEventId: deterministicEventId(`xp:lesson:${current.userId}:${lesson.id}`),
    reason: "lessonCompleted",
  });
  const { newlyAwardedBadges } = await recordGamificationActivity(current.userId, now);

  const lessonsInUnit = snapshot.lessonsByUnit.get(lesson.unitId) ?? [];
  const unitNowComplete = lessonsInUnit.every(
    (unitLesson) => unitLesson.id === lesson.id || snapshot.statusByLesson.get(unitLesson.id) === "completed",
  );

  let nextUnitId: string | null = null;
  if (unitNowComplete) {
    const currentUnit = snapshot.courseDetail.units.find((unit) => unit.id === lesson.unitId);
    const nextUnit = currentUnit
      ? snapshot.courseDetail.units.find((unit) => unit.orderIndex === currentUnit.orderIndex + 1)
      : undefined;
    if (nextUnit) {
      await createAdvanceEnrollmentUseCase().execute(current.userId, snapshot.courseDetail.course.academyId, nextUnit.id);
      nextUnitId = nextUnit.id;
    }
  }

  // Automatic lesson progression: the next lesson in this unit, or the
  // first lesson of the newly-unlocked next unit, or null (course done).
  let nextLessonId: string | null = null;
  const lessonsInCurrentUnit = [...lessonsInUnit].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIndex = lessonsInCurrentUnit.findIndex((unitLesson) => unitLesson.id === lesson.id);
  if (currentIndex !== -1 && currentIndex + 1 < lessonsInCurrentUnit.length) {
    nextLessonId = lessonsInCurrentUnit[currentIndex + 1].id;
  } else if (nextUnitId) {
    const lessonsInNextUnit = [...(snapshot.lessonsByUnit.get(nextUnitId) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    nextLessonId = lessonsInNextUnit[0]?.id ?? null;
  }

  return NextResponse.json(
    {
      completed: true,
      unitCompleted: unitNowComplete,
      nextUnitId,
      nextLessonId,
      xpAwarded: xpAward.applied ? XP_REWARDS.lessonCompleted : 0,
      newlyAwardedBadges,
    },
    { status: 200 },
  );
}
