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
      <div>
        <h1 className="font-display text-4xl font-bold tracking-[-0.01em]">
          {t("title")}
        </h1>
        {/* Brand Book §1's first-mention pairing rule: the full legal name
            appears once, subordinate to the EREA wordmark, then never
            again on this page. */}
        <p className="text-sm tracking-[0.06em] text-muted-foreground uppercase">
          {t("subtitle")}
        </p>
      </div>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </main>
  );
}
