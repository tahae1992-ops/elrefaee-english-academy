import { NextResponse } from "next/server";
import { createGetAttemptStatusUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleGetAttemptStatus } from "@/modules/assessment/interface/get-attempt-status.controller";

// API Spec §7: GET /assessment-attempts/{id}.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleGetAttemptStatus(createGetAttemptStatusUseCase(), user.id, id);
  return NextResponse.json(body, { status });
}
