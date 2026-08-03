import { describe, expect, it } from "vitest";
import { handleHealthCheck } from "./health.controller";
import { CheckIdentityModuleHealthUseCase } from "@/modules/identity/application/use-cases/check-identity-module-health.use-case";
import type { DatabaseHealthPort } from "@/modules/identity/application/ports/database-health-port";

class FakeDatabaseHealthPort implements DatabaseHealthPort {
  constructor(private readonly reachable: boolean) {}
  async ping(): Promise<boolean> {
    return this.reachable;
  }
}

describe("handleHealthCheck (Interface layer)", () => {
  it("maps a healthy result to HTTP 200 with the correct body shape", async () => {
    const useCase = new CheckIdentityModuleHealthUseCase(
      new FakeDatabaseHealthPort(true),
    );

    const { status, body } = await handleHealthCheck(useCase);

    expect(status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(typeof body.checkedAt).toBe("string");
    // Never leaks internal domain representation — the Interface layer
    // shapes a plain response, per the Error Handling layering rule
    // (SAD §22), which applies to success shapes just as much as errors.
    expect(body).not.toHaveProperty("state");
  });

  it("maps an unhealthy result to HTTP 503", async () => {
    const useCase = new CheckIdentityModuleHealthUseCase(
      new FakeDatabaseHealthPort(false),
    );

    const { status, body } = await handleHealthCheck(useCase);

    expect(status).toBe(503);
    expect(body.status).toBe("unhealthy");
  });
});
