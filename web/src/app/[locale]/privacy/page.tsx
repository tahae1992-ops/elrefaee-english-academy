import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Phase 19 (Beta Release) — "finalized ToS/Privacy Policy pages." See
 * terms/page.tsx's own comment: real page, honest draft legal text,
 * not fabricated final copy.
 */
export default function PrivacyPage() {
  const t = useTranslations("LegalPages");
  const tPrivacy = useTranslations("LegalPages.privacy");

  const sections = [1, 2, 3, 4, 5, 6, 7, 8] as const;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <Link href="/">
        <Logo />
      </Link>

      <Alert>
        <Info aria-hidden="true" />
        <AlertDescription>{t("draftBanner")}</AlertDescription>
      </Alert>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{tPrivacy("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tPrivacy("effectiveNotice")}</p>
        </div>

        {sections.map((n) => (
          <section key={n} className="flex flex-col gap-1.5">
            <h2 className="font-display text-lg font-bold">{tPrivacy(`s${n}Heading`)}</h2>
            <p className="text-sm text-muted-foreground">{tPrivacy(`s${n}Body`)}</p>
          </section>
        ))}
      </div>

      <Link href="/" className="text-sm text-primary underline underline-offset-4">
        {t("backToApp")}
      </Link>
    </main>
  );
}
