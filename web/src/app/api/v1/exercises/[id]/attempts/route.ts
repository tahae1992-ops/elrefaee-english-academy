import { NextResponse } from "next/server";
import { z } from "zod";
import { createRecordExerciseAttemptUseCase, createScoreExerciseUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { handleScoreExercise } from "@/modules/curriculum/interface/score-exercise.controller";

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

  return NextResponse.json({ ...scoreResult.score, attemptNumber: attempt.attemptNumber }, { status: 200 });
}
