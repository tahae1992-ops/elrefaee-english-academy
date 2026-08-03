import { ListRolesWithPermissionsUseCase } from "@/modules/identity/application/use-cases/list-roles-with-permissions.use-case";

export interface RoleSummary {
  key: string;
  description: string | null;
  permissionKeys: string[];
}

/**
 * Interface layer — thin: call the use case, shape the response
 * (SAD §6.1). Kept separate from any Next.js page/route so it's
 * testable without the framework runtime.
 */
export async function handleListRoles(
  useCase: ListRolesWithPermissionsUseCase,
): Promise<RoleSummary[]> {
  const roles = await useCase.execute();
  return roles
    .map((role) => ({
      key: role.key,
      description: role.description,
      permissionKeys: [...role.permissionKeys].sort(),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
