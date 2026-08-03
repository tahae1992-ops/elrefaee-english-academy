import { describe, expect, it, vi } from "vitest";
import { ListRolesWithPermissionsUseCase } from "./list-roles-with-permissions.use-case";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";

describe("ListRolesWithPermissionsUseCase", () => {
  it("returns exactly what the repository provides", async () => {
    const roles = [
      { key: "student", description: "Learner", permissionKeys: ["progress.view_own"] },
    ];
    const repository: RoleRepositoryPort = {
      listRolesWithPermissions: vi.fn().mockResolvedValue(roles),
      getRoleAssignmentsForUser: vi.fn(),
    };

    const result = await new ListRolesWithPermissionsUseCase(repository).execute();

    expect(result).toEqual(roles);
  });
});
