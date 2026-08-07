import { NextResponse } from "next/server";
import { createGetCertificateUseCase } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleGetCertificate } from "@/modules/assessment/interface/get-certificate.controller";

/** API Spec §6.6: GET /certificates/{id} -- owner-only. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const { status, body } = await handleGetCertificate(createGetCertificateUseCase(), user.id, id);
  return NextResponse.json(body, { status });
}
