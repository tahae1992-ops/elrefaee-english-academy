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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerAction, type RegisterErrorDebugInfo, type RegisterFieldErrorCode } from "@/modules/identity/interface/register.action";
import { useRouter } from "@/i18n/navigation";

type Translator = ReturnType<typeof useTranslations>;

function buildFormSchema(t: Translator) {
  return z.object({
    displayName: z.string().trim().min(1, t("validation.nameRequired")).max(60),
    email: z.string().trim().toLowerCase().email(t("validation.emailInvalid")),
    password: z.string().min(8, t("validation.passwordTooShort")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success"; emailConfirmationRequired: boolean; email: string }
  | { status: "error"; message: string; debug?: RegisterErrorDebugInfo };

// Maps register.action.ts's semantic field-error codes to translated
// text — the Server Action has no locale context to translate into
// itself (same boundary as the login API), so the client does it.
function translateFieldError(t: Translator, code: RegisterFieldErrorCode) {
  if (code === "required") return t("validation.nameRequired");
  if (code === "invalid") return t("validation.emailInvalid");
  return t("validation.passwordTooShort");
}

export function RegisterForm() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(t)),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitState({ status: "submitting" });
    const result = await registerAction(values);

    if (result.status === "success") {
      if (!result.emailConfirmationRequired) {
        // signUp already established a session (email confirmation is
        // off) — the account is fully usable now, so go straight to
        // the Dashboard instead of an inert "success" card.
        router.push("/dashboard");
        return;
      }
      setSubmitState({
        status: "success",
        emailConfirmationRequired: result.emailConfirmationRequired,
        email: values.email,
      });
      return;
    }

    if (result.fieldErrors) {
      for (const [field, code] of Object.entries(result.fieldErrors)) {
        if (code) {
          form.setError(field as keyof FormValues, { message: translateFieldError(t, code) });
        }
      }
    }
    setSubmitState({
      status: "error",
      message: result.code === "rateLimited" ? t("rateLimited") : (result.message ?? t("genericError")),
      debug: result.debug,
    });
  }

  if (submitState.status === "success") {
    return (
      <Alert data-testid="register-success">
        <AlertDescription>
          {submitState.emailConfirmationRequired
            ? t("successConfirmEmail", { email: submitState.email })
            : t("successReady", { email: submitState.email })}
        </AlertDescription>
      </Alert>
    );
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
            data-testid="register-error-debug"
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("displayNameLabel")}</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>{t("passwordHint")}</FormDescription>
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
