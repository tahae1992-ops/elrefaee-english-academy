import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import {
  AuthProviderError,
  type AuthProviderPort,
  type SignInResult,
  type SignUpResult,
} from "@/modules/identity/application/ports/auth-provider-port";

export class SupabaseAuthAdapter implements AuthProviderPort {
  async signUp(email: string, password: string): Promise<SignUpResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      // Preserve everything Supabase returned (code/status/toJSON
      // payload) — never flatten to a plain Error here, the Interface
      // layer needs the full detail to log/display it during dev.
      throw new AuthProviderError(
        error?.message ?? "Sign-up failed: no user returned",
        error?.code,
        error?.status,
        error?.toJSON() ?? null,
      );
    }

    return {
      userId: data.user.id,
      // A null session means Supabase is holding this email for
      // confirmation (project's "Confirm email" setting) — the caller
      // needs to know this to show the right UI, not just "success".
      emailConfirmationRequired: data.session === null,
    };
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      // Same generic-but-fully-detailed pattern as signUp — the
      // Interface layer decides what's safe to show (API Spec §7.1's
      // no-enumeration rule collapses this to one generic message in
      // production).
      throw new AuthProviderError(
        error?.message ?? "Sign-in failed: no session returned",
        error?.code,
        error?.status,
        error?.toJSON() ?? null,
      );
    }

    return {
      userId: data.user.id,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    };
  }
}
