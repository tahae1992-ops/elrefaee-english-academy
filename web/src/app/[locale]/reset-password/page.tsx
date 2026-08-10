import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ResetPasswordPage" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPasswordPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <Logo />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
