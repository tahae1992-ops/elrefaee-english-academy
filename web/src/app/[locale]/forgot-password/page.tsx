import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ForgotPasswordPage" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error === "expired" || error === "missing-code" ? error : undefined;

  return <ForgotPasswordContent initialError={initialError} />;
}

function ForgotPasswordContent({ initialError }: { initialError?: "expired" | "missing-code" }) {
  const t = useTranslations("ForgotPasswordPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <Logo />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <ForgotPasswordForm initialError={initialError} />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline underline-offset-4">
            {t("backToLoginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
