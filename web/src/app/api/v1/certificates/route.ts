import { NextResponse } from "next/server";
import { createListCertificatesUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleListCertificates } from "@/modules/assessment/interface/list-certificates.controller";

/** API Spec §6.6: GET /certificates -- own certificates only. No POST: issuance is event-driven off a passing certification-exam submission (API Spec §8.1), never a direct client call. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleListCertificates(createListCertificatesUseCase(), user.id);
  return NextResponse.json(body, { status });
}
