import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "./login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LoginPage" });
  return { title: t("title"), description: t("metaDescription") };
}

export default function LoginPage() {
  const t = useTranslations("LoginPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <Logo />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center font-display text-2xl font-bold tracking-[-0.01em]">
          {t("title")}
        </h1>
        <LoginForm />
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-primary underline underline-offset-4">
            {t("forgotPasswordLink")}
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          {/* Persistent underline, not hover-only: a link inline with
              body text needs a non-color cue at rest too (WCAG
              1.4.1 / axe's link-in-text-block), not only on hover. */}
          <Link href="/register" className="text-primary underline underline-offset-4">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
