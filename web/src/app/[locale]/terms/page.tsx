import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Phase 19 (Beta Release) — "finalized ToS/Privacy Policy pages." The
 * page infrastructure is real and live; the legal *text* is an
 * honest, factually-grounded draft reflecting the app's actual
 * documented data practices, not fabricated final legal copy --
 * drafting binding terms is a legal decision outside engineering
 * scope, so this is clearly labeled and deferred to real review
 * rather than presented as launch-ready.
 */
export default function TermsPage() {
  const t = useTranslations("LegalPages");
  const tTerms = useTranslations("LegalPages.terms");

  const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

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
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{tTerms("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tTerms("effectiveNotice")}</p>
        </div>

        {sections.map((n) => (
          <section key={n} className="flex flex-col gap-1.5">
            <h2 className="font-display text-lg font-bold">{tTerms(`s${n}Heading`)}</h2>
            <p className="text-sm text-muted-foreground">{tTerms(`s${n}Body`)}</p>
          </section>
        ))}
      </div>

      <Link href="/" className="text-sm text-primary underline underline-offset-4">
        {t("backToApp")}
      </Link>
    </main>
  );
}
