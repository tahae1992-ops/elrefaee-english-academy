"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "@/i18n/navigation";
import type { LoginErrorDebugInfo, LoginResponseBody } from "@/modules/identity/interface/login.controller";
import type { MfaEnrollResponseBody } from "@/modules/identity/interface/mfa.controller";

type Translator = ReturnType<typeof useTranslations>;

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "error"; message: string; debug?: LoginErrorDebugInfo };

/** Set once login reports `mfaRequired` — everything the MFA step needs to render and to retry without re-entering the password. */
type MfaState = {
  factorId: string;
  challengeId: string;
  /** Present only for a fresh enrollment (Supabase's data:image/svg+xml QR + raw secret) — absent for a returning user who's already enrolled. */
  enrollment?: { qrCode: string; secret: string };
};

function buildFormSchema(t: Translator) {
  return z.object({
    email: z.string().trim().toLowerCase().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });
}

/**
 * The API only ever returns a semantic `error` code (never a message
 * meant for display) — translating by code here, rather than trusting
 * `result.message`, is what actually makes login errors respect the
 * active locale (the route handler has no locale context of its own,
 * SAD §5 addendum: the API is deliberately locale-segment-agnostic).
 */
function translateApiError(t: Translator, error: string | undefined) {
  if (error === "UNAUTHENTICATED") return t("invalidCredentials");
  if (error === "RATE_LIMITED") return t("rateLimited");
  return t("genericError");
}

export function LoginForm() {
  const t = useTranslations("LoginPage");
  const tMfa = useTranslations("LoginPage.mfa");
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [mfaState, setMfaState] = useState<MfaState | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitState({ status: "submitting" });

    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as LoginResponseBody & { debug?: LoginErrorDebugInfo };

    if (response.ok && "mfaRequired" in result) {
      // Blueprint §15: the password step already set an aal1 session
      // cookie (SupabaseAuthAdapter's signIn side effect) — these
      // follow-up calls ride on that, no credentials re-sent.
      if (!result.enrolled) {
        const enrollResponse = await fetch("/api/v1/auth/mfa/enroll", { method: "POST" });
        const enrollResult = (await enrollResponse.json()) as MfaEnrollResponseBody & { message?: string };
        if (!enrollResponse.ok) {
          setSubmitState({ status: "error", message: enrollResult.message ?? tMfa("genericError") });
          return;
        }
        setSubmitState({ status: "idle" });
        setMfaState({
          factorId: enrollResult.factorId,
          challengeId: enrollResult.challengeId,
          enrollment: { qrCode: enrollResult.qrCode, secret: enrollResult.secret },
        });
        return;
      }

      const challengeResponse = await fetch("/api/v1/auth/mfa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId: result.factorId }),
      });
      const challengeResult = (await challengeResponse.json()) as { challengeId: string; message?: string };
      if (!challengeResponse.ok) {
        setSubmitState({ status: "error", message: challengeResult.message ?? tMfa("genericError") });
        return;
      }
      setSubmitState({ status: "idle" });
      setMfaState({ factorId: result.factorId, challengeId: challengeResult.challengeId });
      return;
    }

    if (response.ok) {
      router.push("/dashboard");
      return;
    }

    setSubmitState({
      status: "error",
      message: translateApiError(t, "error" in result ? result.error : undefined),
      debug: "debug" in result ? result.debug : undefined,
    });
  }

  async function onMfaSubmit(values: { code: string }) {
    if (!mfaState) return;
    setSubmitState({ status: "submitting" });

    const response = await fetch("/api/v1/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factorId: mfaState.factorId, challengeId: mfaState.challengeId, code: values.code }),
    });

    if (response.ok) {
      router.push("/dashboard");
      return;
    }

    // A wrong or expired code needs a fresh challenge before another
    // attempt can succeed — the same factorId, no re-enrollment (no
    // re-scanning the QR code) needed for either enroll or challenge mode.
    const retryResponse = await fetch("/api/v1/auth/mfa/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ factorId: mfaState.factorId }),
    });
    const retryResult = (await retryResponse.json()) as { challengeId: string };
    if (retryResponse.ok) {
      setMfaState({ ...mfaState, challengeId: retryResult.challengeId });
    }

    setSubmitState({ status: "error", message: tMfa("invalidCode") });
  }

  const isSubmitting = submitState.status === "submitting";

  if (mfaState) {
    return <MfaStep tMfa={tMfa} mfaState={mfaState} isSubmitting={isSubmitting} submitState={submitState} onSubmit={onMfaSubmit} />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-sm flex-col gap-4"
        noValidate
      >
        {submitState.status === "error" && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        {submitState.status === "error" && submitState.debug && (
          <div
            data-testid="login-error-debug"
            className="rounded-md border border-destructive/40 bg-destructive/5 p-3 font-mono text-xs text-destructive"
          >
            <p>Dev-only detail (never shown in production):</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
              {submitState.debug.name && (
                <>
                  <dt className="text-destructive/70">name</dt>
                  <dd>{submitState.debug.name}</dd>
                </>
              )}
              {submitState.debug.code && (
                <>
                  <dt className="text-destructive/70">code</dt>
                  <dd>{submitState.debug.code}</dd>
                </>
              )}
              {submitState.debug.status !== undefined && (
                <>
                  <dt className="text-destructive/70">status</dt>
                  <dd>{submitState.debug.status}</dd>
                </>
              )}
              <dt className="text-destructive/70">message</dt>
              <dd>{submitState.debug.message}</dd>
            </dl>
            {submitState.debug.rawResponse !== undefined && (
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(submitState.debug.rawResponse, null, 2)}
              </pre>
            )}
            {submitState.debug.stack && (
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap opacity-70">
                {submitState.debug.stack}
              </pre>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("emailLabel")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("passwordLabel")}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}

interface MfaStepProps {
  tMfa: Translator;
  mfaState: MfaState;
  isSubmitting: boolean;
  submitState: SubmitState;
  onSubmit: (values: { code: string }) => void | Promise<void>;
}

function MfaStep({ tMfa, mfaState, isSubmitting, submitState, onSubmit }: MfaStepProps) {
  const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, tMfa("codeRequired")) });
  type CodeValues = z.infer<typeof codeSchema>;

  const form = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-sm flex-col gap-4"
        noValidate
      >
        <div>
          <h2 className="text-lg font-semibold">{mfaState.enrollment ? tMfa("enrollTitle") : tMfa("challengeTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mfaState.enrollment ? tMfa("enrollInstructions") : tMfa("challengeInstructions")}
          </p>
        </div>

        {mfaState.enrollment && (
          <div className="flex flex-col items-center gap-2 rounded-md border p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- a data: URI SVG from Supabase, not an app asset next/image can optimize */}
            <img src={mfaState.enrollment.qrCode} alt={tMfa("enrollTitle")} width={200} height={200} />
            <p className="text-xs text-muted-foreground">{tMfa("secretFallbackLabel")}</p>
            <code className="rounded bg-muted px-2 py-1 text-xs" data-testid="mfa-secret">
              {mfaState.enrollment.secret}
            </code>
          </div>
        )}

        {submitState.status === "error" && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tMfa("codeLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tMfa("verifying") : tMfa("verify")}
        </Button>
      </form>
    </Form>
  );
}
