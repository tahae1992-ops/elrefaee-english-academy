import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
        {t("eyebrow")}
      </p>
      <div className="flex flex-col items-center gap-2">
        <h1>
          <Logo className="text-4xl" />
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
