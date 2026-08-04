import { describe, expect, it, vi } from "vitest";
import { handleLogin } from "./login.controller";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";
import type { AuthService } from "@/modules/identity/application/use-cases/auth.service";

function fakeAuthService(overrides: Partial<AuthService> = {}): AuthService {
  return { login: vi.fn(), register: vi.fn(), ...overrides } as unknown as AuthService;
}

describe("handleLogin", () => {
  it("returns 400 VALIDATION_FAILED for a malformed request, without calling the service", async () => {
    const authService = fakeAuthService();

    const { status, body } = await handleLogin(authService, { email: "not-an-email" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: "Invalid request." });
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("returns 200 with the token pair and roles on success", async () => {
    const authService = fakeAuthService({
      login: vi.fn().mockResolvedValue({
        status: "success",
        accessToken: "at_1",
        refreshToken: "rt_1",
        expiresIn: 3600,
        roles: ["student"],
      }),
    });

    const { status, body } = await handleLogin(authService, {
      email: "yuki@example.com",
      password: "hunter2long",
    });

    expect(status).toBe(200);
    expect(body).toEqual({
      accessToken: "at_1",
      refreshToken: "rt_1",
      expiresIn: 3600,
      roles: ["student"],
    });
  });

  it("returns 501 MFA_NOT_IMPLEMENTED rather than a fabricated challenge id", async () => {
    const authService = fakeAuthService({
      login: vi.fn().mockResolvedValue({ status: "mfa_required" }),
    });

    const { status, body } = await handleLogin(authService, {
      email: "admin@example.com",
      password: "hunter2long",
    });

    expect(status).toBe(501);
    expect(body).toEqual({
      error: "MFA_NOT_IMPLEMENTED",
      message: "MFA is required for this account but not yet supported.",
    });
  });

  it("returns a generic 401 UNAUTHENTICATED on credential failure, never revealing enumeration detail in the primary message field outside dev", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      const authService = fakeAuthService({
        login: vi.fn().mockRejectedValue(new AuthProviderError("Invalid login credentials", "invalid_credentials", 400, null)),
      });

      const { status, body } = await handleLogin(authService, {
        email: "yuki@example.com",
        password: "wrong",
      });

      expect(status).toBe(401);
      expect(body).toEqual({ error: "UNAUTHENTICATED", message: "Invalid email or password.", debug: undefined });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
