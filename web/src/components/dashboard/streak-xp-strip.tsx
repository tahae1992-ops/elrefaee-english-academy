import { Flame, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

/**
 * Doc 09 §5.3: "streak strip uses accent-500 for the flame icon only
 * ... with neutral-900 numeral text" — mapped here to `text-warning`
 * (this codebase's documented icon-only color, doc 09 §2.1) and
 * `text-foreground`. Display-only, no interaction (doc 09 §5.3).
 *
 * Gamification Engine slice: adds the cosmetic XP-level badge
 * (Blueprint §8's motivational-layer "levels" — deliberately styled as
 * a plain muted `Badge`, the same component/variant used for ordinary
 * tags elsewhere, never anything resembling the Certification layer's
 * credential presentation — Blueprint §8's "must never visually or
 * conceptually conflate" rule).
 */
export function StreakXpStrip({ streakDays, xp, level }: { streakDays: number; xp: number; level: number }) {
  const t = useTranslations("Dashboard.streakXp");

  return (
    <div className="flex items-center gap-4 text-sm font-semibold">
      <span className="flex items-center gap-1.5">
        <Flame className="size-4 text-warning" aria-hidden="true" />
        <span className="text-foreground">{t("streakDays", { count: streakDays })}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Zap className="size-4 text-warning" aria-hidden="true" />
        <span className="text-foreground">{t("xp", { count: xp })}</span>
      </span>
      <Badge variant="secondary">{t("level", { level })}</Badge>
    </div>
  );
}
