import { describe, expect, it } from "vitest";
import { CheckIdentityModuleHealthUseCase } from "./check-identity-module-health.use-case";
import type { DatabaseHealthPort } from "@/modules/identity/application/ports/database-health-port";

// A fake port — this is the entire point of Dependency Inversion (SAD
// §6.1): the use case is tested with zero database, zero network, zero
// framework, per SRS §14.1's coverage target on exactly this class of
// logic.
class FakeDatabaseHealthPort implements DatabaseHealthPort {
  constructor(private readonly reachable: boolean) {}
  async ping(): Promise<boolean> {
    return this.reachable;
  }
}

describe("CheckIdentityModuleHealthUseCase", () => {
  it("returns a healthy status when the database is reachable", async () => {
    const useCase = new CheckIdentityModuleHealthUseCase(
      new FakeDatabaseHealthPort(true),
    );

    const result = await useCase.execute();

    expect(result.isHealthy).toBe(true);
    expect(result.state).toBe("healthy");
  });

  it("returns an unhealthy status when the database is unreachable", async () => {
    const useCase = new CheckIdentityModuleHealthUseCase(
      new FakeDatabaseHealthPort(false),
    );

    const result = await useCase.execute();

    expect(result.isHealthy).toBe(false);
    expect(result.state).toBe("unhealthy");
  });
});
