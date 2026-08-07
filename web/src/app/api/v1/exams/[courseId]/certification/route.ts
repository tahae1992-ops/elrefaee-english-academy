import { NextResponse } from "next/server";
import { createGetCourseDetailUseCase, createStartCertificationAttemptUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { gateCertificationAccess } from "@/lib/gate-certification-access";
import { handleStartCertificationAttempt } from "@/modules/assessment/interface/start-certification-attempt.controller";

/**
 * Mirrors GET /quizzes/{unitId}/checkpoint's idempotent fetch-or-create
 * shape (StartCertificationAttemptUseCase resumes an in-progress
 * attempt rather than duplicating it). Keyed by courseId rather than
 * cefrLevel directly -- the course is what the gate check and the
 * calling page already have, and its cefrLevel is what the
 * certification blueprint is actually keyed by.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const gate = await gateCertificationAccess(courseId, user.id);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const courseDetail = await createGetCourseDetailUseCase().execute(courseId);
  const { status, body } = await handleStartCertificationAttempt(createStartCertificationAttemptUseCase(), user.id, courseDetail.course.cefrLevel);
  return NextResponse.json(body, { status });
}
