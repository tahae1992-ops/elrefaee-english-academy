import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import type { CefrLevel } from "@/modules/identity/interface/current-user";

/**
 * Doc 09 §5.3's dominant widget — "the continue widget's whole card
 * is one tap target" and doc 08 §3.4's stated empty-state rule: a
 * brand-new learner sees the placement-test CTA, never an empty
 * lesson list (SRS FR-03). Once assessed, this now links to the real
 * Course Catalog (its genuine next step) rather than a disabled
 * tooltip — the "coming soon" part is lesson content itself
 * (`learning.enrollments`/lesson viewer, still unbuilt), which the
 * tooltip on the badge still discloses honestly.
 */
export function ContinueLearningCard({ currentLevel }: { currentLevel: CefrLevel | null }) {
  const t = useTranslations("Dashboard.continueLearning");

  if (!currentLevel) {
    return (
      <Link href="/placement-test" className="col-span-full md:col-span-2">
        <Card className="flex h-full cursor-pointer flex-col gap-3 border-none bg-accent p-6 text-accent-foreground transition-opacity hover:opacity-90">
          <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground/70 uppercase">
            {t("eyebrowStart")}
          </p>
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 shrink-0" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("title")}</h2>
          </div>
          <p className="text-sm text-accent-foreground/80">{t("description")}</p>
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
        <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground/70 uppercase">
          {t("eyebrowContinue")}
        </p>
        <div className="flex items-center gap-3">
          <Sparkles className="size-6 shrink-0" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("assessedTitle")}</h2>
        </div>
        <p className="text-sm text-accent-foreground/80">{t("assessedDescription")}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="w-fit">
              {t("comingSoon")}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{t("comingSoonHint")}</TooltipContent>
        </Tooltip>
      </Card>
    </Link>
  );
}
