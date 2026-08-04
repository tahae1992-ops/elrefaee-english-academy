import type { AuthService } from "@/modules/identity/application/use-cases/auth.service";

/** API Spec §6.1 `POST /api/v1/auth/logout`. */
export async function handleLogout(
  authService: AuthService,
  userId: string | null,
): Promise<{ status: number; body: { success: true } | { error: string; message: string } }> {
  if (!userId) {
    return { status: 401, body: { error: "UNAUTHENTICATED", message: "No active session." } };
  }

  await authService.logout(userId);
  return { status: 200, body: { success: true } };
}
