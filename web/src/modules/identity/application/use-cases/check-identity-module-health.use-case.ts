import { SystemStatus } from "@/modules/identity/domain/value-objects/system-status";
import type { DatabaseHealthPort } from "@/modules/identity/application/ports/database-health-port";

/**
 * Application layer — orchestrates the Domain object via the Infrastructure
 * port (SAD §6.1). This is the sprint's proof-of-pattern use case: it has
 * no framework dependency, is fully unit-testable with a fake port, and is
 * the shape every later use case in this module (and every other module)
 * follows.
 */
export class CheckIdentityModuleHealthUseCase {
  constructor(private readonly databaseHealth: DatabaseHealthPort) {}

  async execute(): Promise<SystemStatus> {
    const isReachable = await this.databaseHealth.ping();
    return isReachable ? SystemStatus.healthy() : SystemStatus.unhealthy();
  }
}
