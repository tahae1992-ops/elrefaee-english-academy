import { NextResponse } from "next/server";
import { createIdentityHealthUseCase } from "@/composition-root";
import { handleHealthCheck } from "@/modules/identity/interface/health.controller";

// A health-check endpoint is intentionally excluded from both rate-limit
// layers (API Spec §1.8) — uptime monitors and load balancers poll it
// frequently by design, and it carries no sensitive data or side effects.
export async function GET() {
  const useCase = createIdentityHealthUseCase();
  const { status, body } = await handleHealthCheck(useCase);

  return NextResponse.json(body, { status });
}
