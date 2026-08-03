import { CheckIdentityModuleHealthUseCase } from "@/modules/identity/application/use-cases/check-identity-module-health.use-case";
import { DrizzleDatabaseHealthAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-database-health.adapter";
import { ListRolesWithPermissionsUseCase } from "@/modules/identity/application/use-cases/list-roles-with-permissions.use-case";
import { RoleResolver } from "@/modules/identity/application/use-cases/resolve-user-permissions.use-case";
import { DrizzleRoleAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-role.adapter";

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

export function createListRolesUseCase(): ListRolesWithPermissionsUseCase {
  const roleRepository = new DrizzleRoleAdapter();
  return new ListRolesWithPermissionsUseCase(roleRepository);
}

export function createRoleResolver(): RoleResolver {
  const roleRepository = new DrizzleRoleAdapter();
  return new RoleResolver(roleRepository);
}
