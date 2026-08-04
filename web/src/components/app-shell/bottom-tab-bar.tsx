"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/components/app-shell/nav-items";
import { cn } from "@/lib/utils";

/** Doc 08 §3.4: "bottom tab bar (mobile: Home / Review / Courses / Certificates / Profile)". */
export function BottomTabBar() {
  const t = useTranslations("AppShell.nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.comingSoon) {
          return (
            <span
              key={item.key}
              aria-disabled="true"
              className="flex flex-1 cursor-not-allowed flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground/40"
            >
              <Icon className="size-5" aria-hidden="true" />
              {t(`${item.key}.label`)}
            </span>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {t(`${item.key}.label`)}
          </Link>
        );
      })}
    </nav>
  );
}
