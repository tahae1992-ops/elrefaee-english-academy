import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import {
  AuthProviderError,
  type AuthProviderPort,
  type MfaChallengeResult,
  type MfaEnrollResult,
  type MfaFactor,
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

  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AuthProviderError(error.message, error.code, error.status, error.toJSON());
    }
  }

  async requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    // Supabase's own resetPasswordForEmail already never reveals
    // whether the address has an account — no error is returned for
    // "unknown email," only for real failures (rate limit, malformed
    // input). The caller still doesn't branch on this either way.
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw new AuthProviderError(error.message, error.code, error.status, error.toJSON());
    }
  }

  async exchangeRecoveryCode(code: string): Promise<{ userId: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      throw new AuthProviderError(
        error?.message ?? "Recovery code exchange failed: no user returned",
        error?.code,
        error?.status,
        error?.toJSON() ?? null,
      );
    }
    return { userId: data.user.id };
  }

  async updatePassword(newPassword: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new AuthProviderError(error.message, error.code, error.status, error.toJSON());
    }
  }

  async listMfaFactors(): Promise<MfaFactor[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      throw new AuthProviderError(error.message, error.code, error.status, error.toJSON());
    }
    // Supabase's per-type `.totp` breakdown only ever contains
    // verified factors (its own type confirms this) — exactly what
    // login()'s "does this user already have a factor to challenge"
    // check needs; an unverified leftover is enrollMfaFactor's concern.
    return data.totp.map((factor) => ({ id: factor.id, status: factor.status }));
  }

  async enrollMfaFactor(): Promise<MfaEnrollResult> {
    const supabase = await createSupabaseServerClient();

    // Clear any stale unverified factor from an abandoned previous
    // attempt first — Supabase caps the number of factors per user,
    // and an orphaned unverified one would otherwise pile up on every
    // retry without ever becoming the one actually used. Unverified
    // factors only show up in `.all` — the per-type `.totp` breakdown
    // is typed (and populated) as verified-only.
    const { data: existing, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      throw new AuthProviderError(listError.message, listError.code, listError.status, listError.toJSON());
    }
    for (const factor of existing.all) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      throw new AuthProviderError(error?.message ?? "MFA enrollment failed: no factor returned", error?.code, error?.status, error?.toJSON() ?? null);
    }
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  }

  async createMfaChallenge(factorId: string): Promise<MfaChallengeResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error || !data) {
      throw new AuthProviderError(error?.message ?? "MFA challenge failed: no challenge returned", error?.code, error?.status, error?.toJSON() ?? null);
    }
    return { challengeId: data.id };
  }

  async verifyMfaChallenge(factorId: string, challengeId: string, code: string): Promise<SignInResult> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error || !data.access_token) {
      throw new AuthProviderError(error?.message ?? "MFA verification failed: no session returned", error?.code, error?.status, error?.toJSON() ?? null);
    }
    return {
      userId: data.user.id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}
