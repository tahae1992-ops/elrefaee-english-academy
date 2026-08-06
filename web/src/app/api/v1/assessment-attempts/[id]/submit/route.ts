import { NextResponse } from "next/server";
import {
  createFinalizeAttemptUseCase,
  createFinalizeCheckpointAttemptUseCase,
  createGetAttemptKindUseCase,
  createUpdateLearnerLevelUseCase,
} from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleFinalizeAttempt } from "@/modules/assessment/interface/finalize-attempt.controller";
import { handleFinalizeCheckpointAttempt } from "@/modules/assessment/interface/finalize-checkpoint-attempt.controller";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/interface/types";

/**
 * API Spec §6.5: POST /assessment-attempts/{id}/submit — one shared
 * endpoint for both Placement and Unit Checkpoint attempts (the API
 * Spec deliberately doesn't split this by kind). Cross-module
 * orchestration happens here, at the Route Handler (SAD §4 — neither
 * assessment nor identity may reach into the other's internals):
 * assessment scores the attempt, then — only for a placement pass —
 * identity saves the resulting CEFR level to the learner's profile.
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

  let kind;
  try {
    kind = await createGetAttemptKindUseCase().execute(id, user.id);
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return NextResponse.json({ error: "NOT_FOUND", message: error.message }, { status: 404 });
    if (error instanceof AttemptNotOwnedError) return NextResponse.json({ error: "FORBIDDEN", message: error.message }, { status: 403 });
    throw error;
  }

  if (kind.kind === "unit_checkpoint") {
    const result = await handleFinalizeCheckpointAttempt(createFinalizeCheckpointAttemptUseCase(), user.id, id);
    return NextResponse.json(result.body, { status: result.status });
  }

  const result = await handleFinalizeAttempt(createFinalizeAttemptUseCase(), user.id, id);

  if (result.status === 200) {
    await createUpdateLearnerLevelUseCase().execute(user.id, result.body.result.overallLevel);
  }

  return NextResponse.json(result.body, { status: result.status });
}
