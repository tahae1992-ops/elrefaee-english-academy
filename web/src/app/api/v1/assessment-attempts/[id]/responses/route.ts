import { NextResponse } from "next/server";
import { createGetAttemptKindUseCase, createSubmitResponseUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleSubmitResponse } from "@/modules/assessment/interface/submit-response.controller";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/interface/types";
import { logAccessDenied } from "@/lib/log-access-denied";

/**
 * API Spec §6.5: POST /assessment-attempts/{id}/responses — shared by
 * both attempt kinds. `revealCorrectness` (doc 08 §3.9 vs. doc 09
 * §5.3's differing feedback rules) is resolved here from the attempt's
 * own blueprint kind, not passed by the client.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  let revealCorrectness = false;
  try {
    const kind = await createGetAttemptKindUseCase().execute(id, user.id);
    revealCorrectness = kind.kind === "unit_checkpoint";
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return NextResponse.json({ error: "NOT_FOUND", message: error.message }, { status: 404 });
    if (error instanceof AttemptNotOwnedError) {
      await logAccessDenied(user.id, "assessment_attempt.access_denied", "assessment_attempt", id);
      return NextResponse.json({ error: "FORBIDDEN", message: error.message }, { status: 403 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleSubmitResponse(
    createSubmitResponseUseCase(),
    user.id,
    id,
    body,
    revealCorrectness,
  );
  return NextResponse.json(responseBody, { status });
}
