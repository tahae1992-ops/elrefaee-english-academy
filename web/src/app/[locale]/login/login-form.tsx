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

type Translator = ReturnType<typeof useTranslations>;

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "error"; message: string; debug?: LoginErrorDebugInfo };

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
  if (error === "MFA_NOT_IMPLEMENTED") return t("mfaNotImplemented");
  return t("genericError");
}

export function LoginForm() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

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

  const isSubmitting = submitState.status === "submitting";

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
