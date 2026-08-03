import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from "@/modules/identity/infrastructure/db/tables/identity";
import type {
  RoleRecord,
  RoleRepositoryPort,
  UserRoleAssignment,
} from "@/modules/identity/application/ports/role-repository-port";

export class DrizzleRoleAdapter implements RoleRepositoryPort {
  async listRolesWithPermissions(): Promise<RoleRecord[]> {
    const rows = await getDb()
      .select({
        roleKey: roles.key,
        description: roles.description,
        permissionKey: permissions.key,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(permissions.id, rolePermissions.permissionId));

    const byRole = new Map<string, RoleRecord>();
    for (const row of rows) {
      const record = byRole.get(row.roleKey) ?? {
        key: row.roleKey,
        description: row.description,
        permissionKeys: [],
      };
      if (row.permissionKey) {
        record.permissionKeys.push(row.permissionKey);
      }
      byRole.set(row.roleKey, record);
    }
    return [...byRole.values()];
  }

  async getRoleAssignmentsForUser(userId: string): Promise<UserRoleAssignment[]> {
    return getDb()
      .select({ roleKey: roles.key, academyId: userRoles.academyId })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));
  }
}
