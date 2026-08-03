import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware Link/redirect/usePathname/useRouter — always use these,
 * never Next.js's own `next/link`/`next/navigation` directly, so a
 * navigation never accidentally drops the current locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
