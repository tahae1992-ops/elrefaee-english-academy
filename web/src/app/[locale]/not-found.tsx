import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * `not-found.js` components receive no props (Next 16 docs) — nested
 * under `[locale]/layout.tsx`, so it still renders inside the real
 * `<html>`/`<body>` shell with the correct theme, dir, and next-intl
 * locale context already established there; no params needed here.
 */
export default function NotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-6xl font-bold tracking-[-0.02em] text-primary">404</p>
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Button asChild>
        <Link href="/">{t("homeLink")}</Link>
      </Button>
    </main>
  );
}
