import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { TopNav } from "@/components/app-shell/top-nav";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { BottomTabBar } from "@/components/app-shell/bottom-tab-bar";

/**
 * The authenticated app shell (Dashboard Shell slice) — every route
 * under `(app)/` gets the same auth guard, TopNav, SidebarNav
 * (desktop)/BottomTabBar (mobile) for free. Future slices (Placement
 * Test, Course Catalog) land inside this same group rather than
 * rebuilding the chrome.
 */
export default async function AppLayout({
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

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav displayName={current.dashboardData.displayName} email={current.email} />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <BottomTabBar />
    </div>
  );
}
