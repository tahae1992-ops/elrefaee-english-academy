import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "./login-form";

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
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
