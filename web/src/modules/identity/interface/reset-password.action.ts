"use server";

import { z } from "zod";
import { createAuthService } from "@/composition-root";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { AuthProviderError } from "@/modules/identity/application/ports/auth-provider-port";

const resetPasswordSchema = z.object({
  // Same length-only rule as registration (SRS §12.1 / WCAG 2.2
  // Accessible Authentication) — no composition requirements.
  password: z.string().min(8),
});

export type ResetPasswordFieldErrorCode = "tooShort";
export type ResetPasswordFieldErrors = Partial<Record<"password", ResetPasswordFieldErrorCode>>;

export type ResetPasswordResult =
  | { status: "success" }
  | { status: "error"; code?: "noSession"; fieldErrors?: ResetPasswordFieldErrors; message?: string };

/**
 * Interface layer — the reset-password *form's* action. Requires an
 * already-active recovery session (established by the
 * `/api/v1/auth/reset-password/confirm` Route Handler before the user
 * ever sees this form); it does not accept or re-exchange a code
 * itself, matching AuthService.updatePasswordForCurrentSession's own
 * contract.
 */
export async function resetPasswordAction(input: unknown): Promise<ResetPasswordResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // The recovery link was invalid/expired, already used, or the
    // user navigated here directly without going through it — same
    // "no session" outcome either way, the form itself explains what
    // to do next.
    return { status: "error", code: "noSession" };
  }

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", fieldErrors: { password: "tooShort" } };
  }

  try {
    await createAuthService().updatePasswordForCurrentSession(user.id, parsed.data.password);
    return { status: "success" };
  } catch (error) {
    console.error("resetPasswordAction failed:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof AuthProviderError ? error.code : undefined,
      status: error instanceof AuthProviderError ? error.status : undefined,
      rawResponse: error instanceof AuthProviderError ? error.rawResponse : undefined,
    });
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);

    const isDev = process.env.NODE_ENV !== "production";
    return {
      status: "error",
      message: isDev ? (error instanceof Error ? error.message : String(error)) : undefined,
    };
  }
}
