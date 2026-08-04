import { NextResponse } from "next/server";
import { createAuthService } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { handleLogout } from "@/modules/identity/interface/logout.controller";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { status, body } = await handleLogout(createAuthService(), user?.id ?? null);
  return NextResponse.json(body, { status });
}
