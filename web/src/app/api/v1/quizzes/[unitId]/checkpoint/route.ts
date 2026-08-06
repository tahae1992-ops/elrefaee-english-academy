import { NextResponse } from "next/server";
import { createStartCheckpointAttemptUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { gateCheckpointAccess } from "@/lib/gate-checkpoint-access";
import { handleStartCheckpointAttempt } from "@/modules/assessment/interface/start-checkpoint-attempt.controller";

/**
 * API Spec §6.4: GET /quizzes/{unitId}/checkpoint — modeled as an
 * idempotent fetch-or-create (StartCheckpointAttemptUseCase resumes any
 * in-progress attempt rather than duplicating it), so GET's usual
 * semantics still hold from the caller's perspective.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const gate = await gateCheckpointAccess(unitId, user.id);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }

  const { status, body } = await handleStartCheckpointAttempt(createStartCheckpointAttemptUseCase(), user.id, unitId);
  return NextResponse.json(body, { status });
}
