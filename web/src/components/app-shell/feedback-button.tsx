"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { z } from "zod";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
type Translator = ReturnType<typeof useTranslations>;

function buildFormSchema(t: Translator) {
  return z.object({
    category: z.enum(["bug", "suggestion", "other"]),
    message: z.string().trim().min(1, t("validation.messageRequired")).max(2000),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;
type SubmitState = { status: "idle" | "submitting" | "success" | "error"; message?: string };

/**
 * Phase 19 (Beta Release) — "feedback instrumentation." A persistent,
 * always-reachable entry point (top-nav, every authenticated page)
 * rather than buried in a settings page: beta feedback needs to be
 * frictionless to reach the moment something goes wrong.
 */
export function FeedbackButton() {
  const t = useTranslations("Feedback");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(t)),
    defaultValues: { category: "bug", message: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitState({ status: "submitting" });
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, pageUrl: pathname }),
      });
      if (response.status === 429) {
        setSubmitState({ status: "error", message: t("rateLimited") });
        return;
      }
      if (!response.ok) throw new Error("submit-failed");
      setSubmitState({ status: "success" });
      form.reset({ category: "bug", message: "" });
    } catch {
      setSubmitState({ status: "error", message: t("genericError") });
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset a beat after the close animation, not mid-close.
      setTimeout(() => {
        setSubmitState({ status: "idle" });
        form.reset({ category: "bug", message: "" });
      }, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button variant="ghost" size="icon" aria-label={t("trigger")} onClick={() => setOpen(true)}>
        <MessageSquarePlus className="size-4" aria-hidden="true" />
      </Button>
      <DialogContent>
        <DialogTitle>{t("dialogTitle")}</DialogTitle>
        <DialogDescription>{t("dialogDescription")}</DialogDescription>

        {submitState.status === "success" ? (
          <Alert data-testid="feedback-success">
            <AlertDescription>{t("success")}</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {submitState.status === "error" && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{submitState.message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("categoryLabel")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">{t("category.bug")}</SelectItem>
                        <SelectItem value="suggestion">{t("category.suggestion")}</SelectItem>
                        <SelectItem value="other">{t("category.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("messageLabel")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("messagePlaceholder")} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitState.status === "submitting"}>
                {submitState.status === "submitting" ? t("submitting") : t("submit")}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
