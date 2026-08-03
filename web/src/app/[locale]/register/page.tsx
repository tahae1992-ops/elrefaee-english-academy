import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
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
      </div>
    </main>
  );
}
