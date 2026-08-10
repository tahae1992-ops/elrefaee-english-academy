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
import { requestPasswordResetAction } from "@/modules/identity/interface/request-password-reset.action";

type Translator = ReturnType<typeof useTranslations>;

function buildFormSchema(t: Translator) {
  return z.object({
    email: z.string().trim().toLowerCase().email(t("validation.emailInvalid")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success"; email: string }
  | { status: "error"; message: string };

export function ForgotPasswordForm({ initialError }: { initialError?: "expired" | "missing-code" }) {
  const t = useTranslations("ForgotPasswordPage");
  const [submitState, setSubmitState] = useState<SubmitState>(
    initialError ? { status: "error", message: t("linkExpired") } : { status: "idle" },
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(t)),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitState({ status: "submitting" });
    const result = await requestPasswordResetAction(values);

    if (result.status === "success") {
      setSubmitState({ status: "success", email: values.email });
      return;
    }

    setSubmitState({
      status: "error",
      message: result.code === "rateLimited" ? t("rateLimited") : t("genericError"),
    });
  }

  if (submitState.status === "success") {
    return (
      <Alert data-testid="forgot-password-success">
        <AlertDescription>{t("successMessage", { email: submitState.email })}</AlertDescription>
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
