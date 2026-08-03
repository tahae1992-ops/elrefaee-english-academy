import { CheckIdentityModuleHealthUseCase } from "@/modules/identity/application/use-cases/check-identity-module-health.use-case";

export interface HealthResponseBody {
  status: "healthy" | "unhealthy";
  checkedAt: string;
}

/**
 * Interface layer — a thin controller: no business logic of its own,
 * just "call one Application use case → shape response" (SAD §6.1).
 * Kept as a plain function, separate from the Next.js Route Handler file,
 * so it can be unit-tested without Next's route-handler runtime.
 */
export async function handleHealthCheck(
  useCase: CheckIdentityModuleHealthUseCase,
): Promise<{ status: number; body: HealthResponseBody }> {
  const result = await useCase.execute();

  return {
    status: result.isHealthy ? 200 : 503,
    body: {
      status: result.state === "healthy" ? "healthy" : "unhealthy",
      checkedAt: result.checkedAt.toISOString(),
    },
  };
}
