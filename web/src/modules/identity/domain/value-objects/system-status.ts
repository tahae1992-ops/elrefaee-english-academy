export type HealthState = "healthy" | "degraded" | "unhealthy";

/**
 * Domain layer — zero framework/IO dependencies (SAD §6.1). Enforces the
 * one invariant this value object owns: a status is only ever one of the
 * three defined states, and always carries the instant it was determined.
 */
export class SystemStatus {
  private constructor(
    public readonly state: HealthState,
    public readonly checkedAt: Date,
  ) {}

  static healthy(checkedAt: Date = new Date()): SystemStatus {
    return new SystemStatus("healthy", checkedAt);
  }

  static unhealthy(checkedAt: Date = new Date()): SystemStatus {
    return new SystemStatus("unhealthy", checkedAt);
  }

  get isHealthy(): boolean {
    return this.state === "healthy";
  }

  toJSON() {
    return { state: this.state, checkedAt: this.checkedAt.toISOString() };
  }
}
