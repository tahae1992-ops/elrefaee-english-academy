"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Reads its option list from `routing.locales` (src/i18n/routing.ts) —
 * adding a locale there and shipping its message catalog is the only
 * change this component needs; it doesn't hardcode the list itself.
 * Persisting the explicit choice to `user_profiles.preferred_locale`
 * (DDD §3.12, resolution step 1) lands once Sprint 2's auth exists — for
 * an unauthenticated visitor, next-intl's own locale cookie (set by
 * src/proxy.ts) is what persists the choice across visits today.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger size="sm" aria-label={t("label")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {new Intl.DisplayNames([loc], { type: "language" }).of(loc) ??
              loc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
