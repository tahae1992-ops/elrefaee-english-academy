import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import type { AuthProviderPort } from "@/modules/identity/application/ports/auth-provider-port";
import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";

describe("AuthService.register", () => {
  it("signs up via the auth provider, then provisions a profile with the default student role", async () => {
    const authProvider: AuthProviderPort = {
      signUp: vi.fn().mockResolvedValue({ userId: "user-1", emailConfirmationRequired: true }),
    };
    const userProfiles: UserProfileRepositoryPort = {
      createProfileWithDefaultRole: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const service = new AuthService(authProvider, userProfiles);

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
    const authProvider: AuthProviderPort = {
      signUp: vi.fn().mockRejectedValue(new Error("email already registered")),
    };
    const userProfiles: UserProfileRepositoryPort = {
      createProfileWithDefaultRole: vi.fn(),
      findById: vi.fn(),
    };
    const service = new AuthService(authProvider, userProfiles);

    await expect(
      service.register({ email: "x@example.com", password: "password123", displayName: "X" }),
    ).rejects.toThrow("email already registered");
    expect(userProfiles.createProfileWithDefaultRole).not.toHaveBeenCalled();
  });
});
