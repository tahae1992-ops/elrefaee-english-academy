import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createRoleResolver } from "@/composition-root";
import { TopNav } from "@/components/app-shell/top-nav";

// Every route nested here requires a signed-in teacher — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Phase 21, Goal 2 — the teacher app shell. Gated on the
 * `cohort.view_roster_analytics` permission (SRS §4's matrix: granted
 * to instructor/academy_admin/super_admin), not a specific role key,
 * so it stays correct if the permission matrix changes — same pattern
 * as `/roles`'s `roles.manage` gate. Reuses the student app's TopNav
 * (generic enough: display name, theme, locale, sign out) rather than
 * the student-specific SidebarNav/BottomTabBar, which don't apply to
 * a teacher's own navigation.
 */
export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  const permissions = await createRoleResolver().resolveForUser(current.userId);
  if (!permissions.has("cohort.view_roster_analytics")) {
    redirect({ href: "/dashboard", locale });
    return;
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav displayName={current.dashboardData.displayName} email={current.email} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
