import { useTranslations } from "next-intl";
import { Award, Brain, Flame, Footprints, Star, Trophy, Zap, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import type { BadgeWithStatus } from "@/modules/engagement/interface/types";

/** Maps `engagement.badges.icon_ref` (migration 0025's seed) to the matching lucide icon — the DB stores a stable string key, never a component reference. */
const BADGE_ICONS: Record<string, LucideIcon> = { Footprints, Zap, Flame, Star, Trophy, Brain };

/**
 * "Implement achievements and badges" + Dashboard display requirement.
 * Deliberately styled with plain muted icon tiles, not medal/ribbon/
 * certificate imagery — Blueprint §8's "must never visually or
 * conceptually conflate" the motivational layer with the Certification
 * layer's credential presentation.
 */
export function BadgesCard({ badges }: { badges: BadgeWithStatus[] }) {
  const t = useTranslations("Dashboard.badges");
  const earned = badges.filter((badge) => badge.earnedAt !== null);

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("title", { earned: earned.length, total: badges.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earned.length === 0 ? (
          <EmptyState icon={Award} title={t("emptyTitle")} description={t("emptyDescription")} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.iconRef] ?? Award;
              const isEarned = badge.earnedAt !== null;
              return (
                <li
                  key={badge.key}
                  className={cn("flex flex-col items-center gap-1.5 rounded-md p-3 text-center", isEarned ? "bg-muted" : "opacity-40")}
                  title={badge.description}
                >
                  <Icon className={cn("size-6", isEarned ? "text-warning" : "text-muted-foreground")} aria-hidden="true" />
                  <p className="text-xs font-medium">{badge.name}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
