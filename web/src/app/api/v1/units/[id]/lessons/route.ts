import { NextResponse } from "next/server";
import { createGetUnitDetailUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleGetUnitDetail } from "@/modules/curriculum/interface/get-unit-detail.controller";

// API Spec §6.3: GET /units/{id}/lessons.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleGetUnitDetail(createGetUnitDetailUseCase(), id);
  return NextResponse.json(body, { status });
}
