export interface RoleRecord {
  key: string;
  description: string | null;
  permissionKeys: string[];
}

export interface UserRoleAssignment {
  roleKey: string;
  academyId: string | null;
}

/**
 * Application layer port (SAD §6.1) — the Application layer's only
 * contract with role/permission data; the Infrastructure layer supplies
 * the Drizzle-backed implementation.
 */
export interface RoleRepositoryPort {
  listRolesWithPermissions(): Promise<RoleRecord[]>;
  getRoleAssignmentsForUser(userId: string): Promise<UserRoleAssignment[]>;
}
