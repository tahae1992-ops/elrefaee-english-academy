import { resolvePermissions } from "@/modules/identity/domain/services/resolve-permissions";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";

/**
 * SAD §8's RoleResolver — resolves an authenticated user's effective
 * permission set. I/O orchestration only; the actual set-union logic
 * lives in the pure domain function this delegates to.
 */
export class RoleResolver {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async resolveForUser(userId: string): Promise<Set<string>> {
    const [assignments, roles] = await Promise.all([
      this.roleRepository.getRoleAssignmentsForUser(userId),
      this.roleRepository.listRolesWithPermissions(),
    ]);

    const rolePermissionMap = new Map(
      roles.map((role) => [role.key, role.permissionKeys] as const),
    );
    const roleKeys = assignments.map((assignment) => assignment.roleKey);

    return resolvePermissions(roleKeys, rolePermissionMap);
  }
}
