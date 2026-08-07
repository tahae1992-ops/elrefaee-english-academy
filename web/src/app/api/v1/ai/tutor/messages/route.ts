import { NextResponse } from "next/server";
import { createSendTutorMessageUseCase, createGetConversationHistoryUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { gateLessonAccess } from "@/lib/gate-lesson-access";
import { buildTutorLessonContext } from "@/lib/build-tutor-lesson-context";
import { handleSendTutorMessage, sendTutorMessageRequestSchema } from "@/modules/ai/interface/send-tutor-message.controller";

/**
 * API Spec §6.9: POST /ai/tutor/messages (FR-12). GET (not in the API
 * spec's table, an additive extension of the same resource path) is
 * "Support conversation history" — reopening the docked chat panel
 * (doc 08 §3.11) resumes the same (learner, lesson) thread.
 */
export async function POST(request: Request) {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = sendTutorMessageRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "Invalid request." }, { status: 400 });
  }
  const { lessonId, message } = parsed.data;

  const gate = await gateLessonAccess(lessonId, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const promptContext = await buildTutorLessonContext(current.userId, gate.lesson, current.dashboardData.currentLevel);
  const { status, body } = await handleSendTutorMessage(createSendTutorMessageUseCase(), current.userId, lessonId, message, promptContext, new Date());
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "lessonId query param is required." }, { status: 400 });
  }

  const gate = await gateLessonAccess(lessonId, current.userId, current.dashboardData.currentLevel);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  try {
    const messages = await createGetConversationHistoryUseCase().execute(current.userId, lessonId, new Date());
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/ai/tutor/messages failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return NextResponse.json({ error: "INTERNAL", message: "Could not load conversation history." }, { status: 500 });
  }
}
