import { NextResponse } from "next/server";
import { createFinalizeAttemptUseCase, createUpdateLearnerLevelUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleFinalizeAttempt } from "@/modules/assessment/interface/finalize-attempt.controller";

/**
 * API Spec §7: POST /assessment-attempts/{id}/submit. Cross-module
 * orchestration happens here, at the Route Handler (SAD §4 — neither
 * assessment nor identity may reach into the other's internals):
 * assessment scores the attempt, then — only on success — identity
 * saves the resulting CEFR level to the learner's profile.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const result = await handleFinalizeAttempt(createFinalizeAttemptUseCase(), user.id, id);

  if (result.status === 200) {
    await createUpdateLearnerLevelUseCase().execute(user.id, result.body.result.overallLevel);
  }

  return NextResponse.json(result.body, { status: result.status });
}
