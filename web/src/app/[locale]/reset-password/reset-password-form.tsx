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
import { resetPasswordAction } from "@/modules/identity/interface/reset-password.action";
import { Link, useRouter } from "@/i18n/navigation";

type Translator = ReturnType<typeof useTranslations>;

function buildFormSchema(t: Translator) {
  return z.object({
    password: z.string().min(8, t("validation.passwordTooShort")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

type SubmitState =
  | { status: "idle" | "submitting" }
  | { status: "success" }
  | { status: "noSession" }
  | { status: "error"; message: string };

export function ResetPasswordForm() {
  const t = useTranslations("ResetPasswordPage");
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(t)),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitState({ status: "submitting" });
    const result = await resetPasswordAction(values);

    if (result.status === "success") {
      setSubmitState({ status: "success" });
      setTimeout(() => router.push("/dashboard"), 2000);
      return;
    }

    if (result.code === "noSession") {
      setSubmitState({ status: "noSession" });
      return;
    }

    if (result.fieldErrors?.password) {
      form.setError("password", { message: t("validation.passwordTooShort") });
    }
    setSubmitState({ status: "error", message: result.message ?? t("genericError") });
  }

  if (submitState.status === "noSession") {
    return (
      <Alert variant="destructive" role="alert" data-testid="reset-password-no-session">
        <AlertDescription>
          {t("linkExpired")}{" "}
          <Link href="/forgot-password" className="text-primary underline underline-offset-4">
            {t("requestNewLink")}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (submitState.status === "success") {
    return (
      <Alert data-testid="reset-password-success">
        <AlertDescription>{t("successMessage")}</AlertDescription>
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
