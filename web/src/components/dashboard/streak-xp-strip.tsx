import { Flame, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Doc 09 §5.3: "streak strip uses accent-500 for the flame icon only
 * ... with neutral-900 numeral text" — mapped here to `text-warning`
 * (this codebase's documented icon-only color, doc 09 §2.1) and
 * `text-foreground`. Display-only, no interaction (doc 09 §5.3).
 */
export function StreakXpStrip({ streakDays, xp }: { streakDays: number; xp: number }) {
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
    </div>
  );
}
