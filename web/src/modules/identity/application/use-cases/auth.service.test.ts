import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import type { AuthProviderPort } from "@/modules/identity/application/ports/auth-provider-port";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";
import type { RoleRepositoryPort } from "@/modules/identity/application/ports/role-repository-port";
import type { AuditLogPort } from "@/shared/application/ports/audit-log-port";
import type { RefreshTokenRepositoryPort } from "@/modules/identity/application/ports/refresh-token-repository-port";

function buildService(overrides: {
  authProvider?: Partial<AuthProviderPort>;
  userProfiles?: Partial<UserProfileRepositoryPort>;
  roleRepository?: Partial<RoleRepositoryPort>;
  auditLog?: Partial<AuditLogPort>;
  refreshTokens?: Partial<RefreshTokenRepositoryPort>;
} = {}) {
  const authProvider: AuthProviderPort = {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...overrides.authProvider,
  };
  const userProfiles: UserProfileRepositoryPort = {
    createProfileWithDefaultRole: vi.fn(),
    findById: vi.fn(),
    updateCurrentLevel: vi.fn(),
    ...overrides.userProfiles,
  };
  const roleRepository: RoleRepositoryPort = {
    listRolesWithPermissions: vi.fn(),
    getRoleAssignmentsForUser: vi.fn().mockResolvedValue([]),
    ...overrides.roleRepository,
  };
  const auditLog: AuditLogPort = {
    record: vi.fn().mockResolvedValue(undefined),
    ...overrides.auditLog,
  };
  const refreshTokens: RefreshTokenRepositoryPort = {
    record: vi.fn().mockResolvedValue(undefined),
    ...overrides.refreshTokens,
  };

  return {
    service: new AuthService(authProvider, userProfiles, roleRepository, auditLog, refreshTokens),
    authProvider,
    userProfiles,
    roleRepository,
    auditLog,
    refreshTokens,
  };
}

describe("AuthService.register", () => {
  it("signs up via the auth provider, then provisions a profile with the default student role", async () => {
    const { service, authProvider, userProfiles } = buildService({
      authProvider: {
        signUp: vi.fn().mockResolvedValue({ userId: "user-1", emailConfirmationRequired: true }),
      },
    });

    const result = await service.register({
      email: "yuki@example.com",
      password: "correcthorsebatterystaple",
      displayName: "Yuki",
    });

    expect(authProvider.signUp).toHaveBeenCalledWith(
      "yuki@example.com",
      "correcthorsebatterystaple",
    );
    expect(userProfiles.createProfileWithDefaultRole).toHaveBeenCalledWith({
      userId: "user-1",
      displayName: "Yuki",
      defaultRoleKey: "student",
    });
    expect(result).toEqual({ userId: "user-1", emailConfirmationRequired: true });
  });

  it("propagates a sign-up failure without attempting to provision a profile", async () => {
    const { service, userProfiles } = buildService({
      authProvider: { signUp: vi.fn().mockRejectedValue(new Error("email already registered")) },
    });

    await expect(
      service.register({ email: "x@example.com", password: "password123", displayName: "X" }),
    ).rejects.toThrow("email already registered");
    expect(userProfiles.createProfileWithDefaultRole).not.toHaveBeenCalled();
  });
});

describe("AuthService.login", () => {
  it("returns a token pair and resolved role keys, and records the refresh token + a success audit entry", async () => {
    const { service, auditLog, refreshTokens } = buildService({
      authProvider: {
        signIn: vi.fn().mockResolvedValue({
          userId: "user-1",
          accessToken: "at_1",
          refreshToken: "rt_1",
          expiresIn: 3600,
        }),
      },
      roleRepository: {
        getRoleAssignmentsForUser: vi
          .fn()
          .mockResolvedValue([{ roleKey: "student", academyId: "academy-1" }]),
      },
    });

    const result = await service.login({ email: "yuki@example.com", password: "hunter2long" });

    expect(result).toEqual({
      status: "success",
      accessToken: "at_1",
      refreshToken: "rt_1",
      expiresIn: 3600,
      roles: ["student"],
    });
    expect(refreshTokens.record).toHaveBeenCalledWith({
      userId: "user-1",
      refreshToken: "rt_1",
      expiresInSeconds: 3600,
    });
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: "user-1", action: "auth.login.success" }),
    );
  });

  it("returns mfa_required for a user holding an elevated role, without issuing a token pair", async () => {
    const { service, refreshTokens } = buildService({
      authProvider: {
        signIn: vi.fn().mockResolvedValue({
          userId: "user-2",
          accessToken: "at_2",
          refreshToken: "rt_2",
          expiresIn: 3600,
        }),
      },
      roleRepository: {
        getRoleAssignmentsForUser: vi
          .fn()
          .mockResolvedValue([{ roleKey: "academy_admin", academyId: null }]),
      },
    });

    const result = await service.login({ email: "admin@example.com", password: "hunter2long" });

    expect(result).toEqual({ status: "mfa_required" });
    expect(refreshTokens.record).not.toHaveBeenCalled();
  });

  it("records a failure audit entry (null actor, hashed email) and rethrows on bad credentials", async () => {
    const { service, auditLog } = buildService({
      authProvider: { signIn: vi.fn().mockRejectedValue(new Error("Invalid login credentials")) },
    });

    await expect(
      service.login({ email: "yuki@example.com", password: "wrong-password" }),
    ).rejects.toThrow("Invalid login credentials");

    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: null, action: "auth.login.failure" }),
    );
    const [entry] = vi.mocked(auditLog.record).mock.calls[0];
    expect(entry.after?.emailHash).toEqual(expect.any(String));
    expect(entry.after?.emailHash).not.toContain("yuki");
  });
});

describe("AuthService.logout", () => {
  it("signs out via the auth provider and records an audit entry", async () => {
    const { service, authProvider, auditLog } = buildService();

    await service.logout("user-1");

    expect(authProvider.signOut).toHaveBeenCalled();
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: "user-1", action: "auth.logout", entityId: "user-1" }),
    );
  });
});
