import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
        {t("eyebrow")}
      </p>
      <h1 className="max-w-xl font-display text-4xl font-bold text-balance">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </main>
  );
}
