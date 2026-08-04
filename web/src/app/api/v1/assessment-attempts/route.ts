import { NextResponse } from "next/server";
import { createStartPlacementAttemptUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleStartAttempt } from "@/modules/assessment/interface/start-attempt.controller";

// API Spec §7: POST /assessment-attempts — assembles Stage 2's fixed item set.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleStartAttempt(
    createStartPlacementAttemptUseCase(),
    user.id,
    body,
  );
  return NextResponse.json(responseBody, { status });
}
