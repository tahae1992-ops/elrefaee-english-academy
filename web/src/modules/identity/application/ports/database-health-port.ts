/**
 * Application layer — a port the Domain/Application layers depend on and
 * the Infrastructure layer implements (Dependency Inversion Principle,
 * SAD §6.1). The Application layer never imports Drizzle/postgres
 * directly; it only knows this contract.
 */
export interface DatabaseHealthPort {
  /**
   * Resolves true if the database is reachable and responsive, false
   * otherwise. Must not throw — a connectivity failure is a normal,
   * expected outcome for a health check, not an exceptional one.
   */
  ping(): Promise<boolean>;
}
