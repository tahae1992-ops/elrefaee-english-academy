import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";

/**
 * Next.js's route-level loading convention (renders automatically during
 * a slow navigation/data fetch) — the first brand-bearing thing a user
 * on a slow connection sees, not a generic unbranded spinner (Brand
 * Book §7). The pulse is gated behind `motion-safe:` so it's inert for
 * anyone with `prefers-reduced-motion` set (Design System §4.6).
 */
export default async function Loading() {
  const t = await getTranslations("Common");

  return (
    <div
      role="status"
      aria-label={t("loading")}
      className="flex flex-1 items-center justify-center p-8"
    >
      <Logo variant="mark" className="h-10 w-10 motion-safe:animate-pulse" />
    </div>
  );
}
