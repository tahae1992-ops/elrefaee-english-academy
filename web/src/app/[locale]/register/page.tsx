import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <Logo />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center font-display text-2xl font-bold tracking-[-0.01em]">
          {t("title")}
        </h1>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          {/* Persistent underline, not hover-only: a link inline with
              body text needs a non-color cue at rest too (WCAG
              1.4.1 / axe's link-in-text-block), not only on hover. */}
          <Link href="/login" className="text-primary underline underline-offset-4">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
