"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/components/app-shell/nav-items";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Doc 09 §5.3: desktop-only ("sidebar-adjacent main column") — mobile
 * uses BottomTabBar instead, same items, doc 08 §3.4.
 */
export function SidebarNav() {
  const t = useTranslations("AppShell.nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar p-4 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.comingSoon) {
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <span
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/40"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`${item.key}.label`)}
                  <Badge variant="outline" className="ms-auto text-[10px]">
                    {t("comingSoon")}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">{t(`${item.key}.comingSoonHint`)}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {t(`${item.key}.label`)}
          </Link>
        );
      })}
    </nav>
  );
}
