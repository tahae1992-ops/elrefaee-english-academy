import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { createGetDashboardDataUseCase } from "@/composition-root";
import { redirect } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The Register slice's redirect target (Vertical Slice Development —
 * "no feature is complete until it's fully usable through the UI").
 * Minimal by design: proves a session survives past registration and
 * that RoleResolver/GetDashboardDataUseCase are wired for a real
 * authenticated user, not the full Dashboard feature from the Sprint
 * Plan roadmap.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/register", locale });
    return;
  }

  const dashboardData = await createGetDashboardDataUseCase().execute(user.id);

  if (!dashboardData) {
    redirect({ href: "/register", locale });
    return;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 p-8">
      <Logo />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome, {dashboardData.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          <div className="flex flex-wrap gap-2">
            {dashboardData.permissionKeys.map((key) => (
              <Badge key={key} variant="secondary">
                {key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
