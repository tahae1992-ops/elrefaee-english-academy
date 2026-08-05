import { NextResponse } from "next/server";
import { z } from "zod";
import { createRecordExerciseAttemptUseCase, createScoreExerciseUseCase, createSubmitReviewResponseUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleScoreExercise } from "@/modules/curriculum/interface/score-exercise.controller";
import { ReviewItemNotFoundError } from "@/modules/learning/interface/types";

const requestSchema = z.object({
  lessonId: z.string(),
  latencyMs: z.number().int().min(0),
  response: z.unknown(),
});

/**
 * API Spec §6.4: POST /exercises/{id}/attempts (FR-07). `lessonId` is
 * required in the body — an exercise `content_items` row has no FK
 * back to the lesson that references it (curriculum.ts), and lessonId
 * is also what access-gating needs (is this exercise's lesson's
 * course/unit unlocked for this learner right now).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const rawBody = await request.json();
  const parsedRequest = requestSchema.safeParse(rawBody);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "Invalid request." }, { status: 400 });
  }
  const { lessonId, latencyMs, response } = parsedRequest.data;

  const gate = await gateLessonAccess(lessonId, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const scoreResult = await handleScoreExercise(createScoreExerciseUseCase(), id, response);
  if (scoreResult.status !== 200 || !scoreResult.score || !scoreResult.parsedResponse) {
    return NextResponse.json(scoreResult.body, { status: scoreResult.status });
  }

  const attempt = await createRecordExerciseAttemptUseCase().execute({
    userId: current.userId,
    exerciseId: id,
    lessonId,
    responsePayload: scoreResult.parsedResponse,
    isCorrect: scoreResult.score.isCorrect,
    latencyMs,
  });

  // Review Engine integration: an incorrect answer demotes this lesson's
  // already-tracked target vocabulary (as if the learner had rated it
  // "again" in a review session) so it resurfaces sooner — this slice's
  // "review queues from incorrect answers" requirement. Only demotes
  // items already in the learner's queue (from a prior lesson
  // completion); it never queues a brand-new item here, since queueing
  // only happens at lesson completion (FR-09's own Main Flow).
  if (!scoreResult.score.isCorrect) {
    const wrapUpBlock = gate.lesson.content.blocks.find((block) => block.type === "wrap_up");
    if (wrapUpBlock && wrapUpBlock.type === "wrap_up") {
      const submitReviewResponse = createSubmitReviewResponseUseCase();
      for (const { id: vocabularyEntryId } of wrapUpBlock.targetVocabulary) {
        try {
          await submitReviewResponse.execute(current.userId, vocabularyEntryId, "again", crypto.randomUUID(), new Date());
        } catch (error) {
          if (!(error instanceof ReviewItemNotFoundError)) throw error;
        }
      }
    }
  }

  return NextResponse.json({ ...scoreResult.score, attemptNumber: attempt.attemptNumber }, { status: 200 });
}
