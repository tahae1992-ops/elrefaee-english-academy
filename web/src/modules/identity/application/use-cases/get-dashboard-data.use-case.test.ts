import { describe, expect, it, vi } from "vitest";
import { GetDashboardDataUseCase } from "./get-dashboard-data.use-case";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";
import type { RoleResolver } from "./resolve-user-permissions.use-case";

describe("GetDashboardDataUseCase", () => {
  it("combines the profile and resolved permissions for an existing user", async () => {
    const userProfiles: UserProfileRepositoryPort = {
      createProfileWithDefaultRole: vi.fn(),
      updateCurrentLevel: vi.fn(),
      findById: vi
        .fn()
        .mockResolvedValue({ userId: "user-1", displayName: "Yuki", currentLevel: "b1" }),
    };
    const roleResolver = {
      resolveForUser: vi.fn().mockResolvedValue(new Set(["progress.view_own", "learning.attempt"])),
    } as unknown as RoleResolver;

    const result = await new GetDashboardDataUseCase(userProfiles, roleResolver).execute("user-1");

    expect(result).toEqual({
      displayName: "Yuki",
      currentLevel: "b1",
      permissionKeys: ["learning.attempt", "progress.view_own"],
    });
  });

  it("returns null when no profile exists for the given user id", async () => {
    const userProfiles: UserProfileRepositoryPort = {
      createProfileWithDefaultRole: vi.fn(),
      updateCurrentLevel: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const roleResolver = { resolveForUser: vi.fn() } as unknown as RoleResolver;

    const result = await new GetDashboardDataUseCase(userProfiles, roleResolver).execute("ghost");

    expect(result).toBeNull();
    expect(roleResolver.resolveForUser).not.toHaveBeenCalled();
  });
});
