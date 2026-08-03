import { describe, expect, it, vi } from "vitest";
import { RoleResolver } from "./resolve-user-permissions.use-case";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";

function fakeRepository(overrides: Partial<RoleRepositoryPort> = {}): RoleRepositoryPort {
  return {
    listRolesWithPermissions: vi.fn().mockResolvedValue([
      { key: "student", description: null, permissionKeys: ["progress.view_own"] },
      {
        key: "instructor",
        description: null,
        permissionKeys: ["cohort.view_roster_analytics", "homework.assign_track"],
      },
    ]),
    getRoleAssignmentsForUser: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("RoleResolver", () => {
  it("resolves the union of permissions for every role a user is assigned", async () => {
    const repository = fakeRepository({
      getRoleAssignmentsForUser: vi
        .fn()
        .mockResolvedValue([{ roleKey: "instructor", academyId: "academy-1" }]),
    });
    const resolver = new RoleResolver(repository);

    const result = await resolver.resolveForUser("user-1");

    expect(result).toEqual(
      new Set(["cohort.view_roster_analytics", "homework.assign_track"]),
    );
  });

  it("resolves an empty set for a user with no role assignments", async () => {
    const resolver = new RoleResolver(fakeRepository());

    const result = await resolver.resolveForUser("user-with-no-roles");

    expect(result).toEqual(new Set());
  });
});
