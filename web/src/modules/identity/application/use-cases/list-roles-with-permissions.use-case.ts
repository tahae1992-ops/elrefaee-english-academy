import type { RoleRecord, RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";

/**
 * Reused by the future Admin "Manage Roles" screen (SRS §4's "Manage
 * roles/permissions" permission) as well as this sprint's roles
 * preview page — real functionality, not a throwaway demo query.
 */
export class ListRolesWithPermissionsUseCase {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async execute(): Promise<RoleRecord[]> {
    return this.roleRepository.listRolesWithPermissions();
  }
}
