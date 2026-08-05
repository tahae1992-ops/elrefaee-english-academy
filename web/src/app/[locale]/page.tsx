import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";

/**
 * The production entry point (replaces Sprint 1's Foundation splash).
 * No standalone content of its own — every visitor is routed straight
 * to where they belong: signed-in learners to their Dashboard, everyone
 * else to Sign in. Reuses the same auth check as (app)/layout.tsx.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const current = await getCurrentUserWithDashboardData();

  redirect({ href: current ? "/dashboard" : "/login", locale });
}
