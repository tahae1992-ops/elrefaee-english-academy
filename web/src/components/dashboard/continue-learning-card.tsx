import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Doc 09 §5.3's dominant widget — "the continue widget's whole card
 * is one tap target" and doc 08 §3.4's stated empty-state rule: a
 * brand-new learner sees the placement-test CTA, never an empty
 * lesson list (SRS FR-03). Placement Test itself is the next roadmap
 * slice, so the CTA is real UI, disabled with an honest "coming soon"
 * rather than a route that 404s.
 */
export function ContinueLearningCard({ hasStartedLearning }: { hasStartedLearning: boolean }) {
  const t = useTranslations("Dashboard.continueLearning");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          role="button"
          aria-disabled="true"
          tabIndex={0}
          className="col-span-full flex cursor-not-allowed flex-col gap-3 border-none bg-accent p-6 text-accent-foreground md:col-span-2"
        >
          <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground/70 uppercase">
            {hasStartedLearning ? t("eyebrowContinue") : t("eyebrowStart")}
          </p>
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 shrink-0" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">
              {t("title")}
            </h2>
          </div>
          <p className="text-sm text-accent-foreground/80">{t("description")}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-90">
              {t("cta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
            <Badge variant="outline">{t("comingSoon")}</Badge>
          </div>
        </Card>
      </TooltipTrigger>
      <TooltipContent>{t("comingSoonHint")}</TooltipContent>
    </Tooltip>
  );
}
