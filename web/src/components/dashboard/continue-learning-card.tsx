import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { CefrLevel } from "@/modules/identity/interface/current-user";

/**
 * Doc 09 §5.3's dominant widget — "the continue widget's whole card
 * is one tap target" and doc 08 §3.4's stated empty-state rule: a
 * brand-new learner sees the placement-test CTA, never an empty
 * lesson list (SRS FR-03). Once assessed, this links to the Course
 * Catalog -- lesson content itself has since shipped (Phase 6), so
 * this no longer carries the "coming soon" badge/tooltip it used to
 * (found stale during Phase 19's bug-bash: it still claimed lesson
 * content was unbuilt well after it existed and worked).
 */
export function ContinueLearningCard({ currentLevel }: { currentLevel: CefrLevel | null }) {
  const t = useTranslations("Dashboard.continueLearning");

  if (!currentLevel) {
    return (
      <Link href="/placement-test" className="col-span-full md:col-span-2">
        <Card className="flex h-full cursor-pointer flex-col gap-3 border-none bg-accent p-6 text-accent-foreground transition-opacity hover:opacity-90">
          <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground uppercase">
            {t("eyebrowStart")}
          </p>
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 shrink-0" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h2>
          </div>
          {/* Full opacity, not /80: accent-foreground on bg-accent is
              tuned to pass 4.5:1 at full strength (the title above
              proves it); the multiplied-down variant dropped to
              4.14:1. Font-weight already distinguishes the title
              from this description line. */}
          <p className="text-sm text-accent-foreground">{t("description")}</p>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {t("cta")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Card>
      </Link>
    );
  }

  return (
    <Link href="/courses" className="col-span-full md:col-span-2">
      <Card className="flex h-full cursor-pointer flex-col gap-3 border-none bg-accent p-6 text-accent-foreground transition-opacity hover:opacity-90">
        <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground uppercase">
          {t("eyebrowContinue")}
        </p>
        <div className="flex items-center gap-3">
          <Sparkles className="size-6 shrink-0" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("assessedTitle")}</h2>
        </div>
        <p className="text-sm text-accent-foreground">{t("assessedDescription")}</p>
      </Card>
    </Link>
  );
}
