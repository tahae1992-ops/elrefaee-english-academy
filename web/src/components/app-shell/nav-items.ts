import { Award, BookOpen, Home, RotateCcw, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  /** Matches messages/en.json's AppShell.nav.* keys. */
  key: "home" | "review" | "courses" | "certificates" | "profile";
  href: string;
  icon: LucideIcon;
  /** Doc 08 §3.4's exact IA (Home / Review / Courses / Certificates / Profile) — Certificates/Profile aren't built yet, shown disabled rather than as dead links. */
  comingSoon: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: "home", href: "/dashboard", icon: Home, comingSoon: false },
  { key: "review", href: "/review", icon: RotateCcw, comingSoon: false },
  { key: "courses", href: "/courses", icon: BookOpen, comingSoon: false },
  { key: "certificates", href: "/certificates", icon: Award, comingSoon: true },
  { key: "profile", href: "/profile", icon: User, comingSoon: true },
];
