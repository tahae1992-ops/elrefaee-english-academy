import { NextResponse } from "next/server";
import { createSubmitResponseUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleSubmitResponse } from "@/modules/assessment/interface/submit-response.controller";

// API Spec §7: POST /assessment-attempts/{id}/responses.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { status, body: responseBody } = await handleSubmitResponse(
    createSubmitResponseUseCase(),
    user.id,
    id,
    body,
  );
  return NextResponse.json(responseBody, { status });
}
