import { CheckIdentityModuleHealthUseCase } from "@/modules/identity/application/use-cases/check-identity-module-health.use-case";
import { DrizzleDatabaseHealthAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-database-health.adapter";

/**
 * The single composition point that wires Infrastructure implementations
 * into Application use cases via their port interfaces (SAD §6.1's
 * Dependency Injection rule). Route Handlers (Interface layer) import
 * from here — never from a module's infrastructure directly.
 *
 * As new modules land, each gets its own factory here, following this
 * same shape.
 */
export function createIdentityHealthUseCase(): CheckIdentityModuleHealthUseCase {
  const databaseHealthAdapter = new DrizzleDatabaseHealthAdapter();
  return new CheckIdentityModuleHealthUseCase(databaseHealthAdapter);
}
