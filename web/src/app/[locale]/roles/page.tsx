import { createListRolesUseCase } from "@/composition-root";
import { handleListRoles } from "@/modules/identity/interface/roles.controller";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { redirect } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sprint 2 Task 2's visible proof: the seeded RBAC data (DDD §3.1,
 * SRS §4's matrix), read through the real Application/Infrastructure
 * stack (ListRolesWithPermissionsUseCase → DrizzleRoleAdapter), not a
 * one-off query. Doubles as the seed of the future Admin "Manage
 * Roles" screen. Phase 17 security audit finding: this page lives
 * outside the `(app)` route group, so it never got that layout's auth
 * guard -- the entire role/permission matrix was readable by anyone,
 * unauthenticated. Guarded directly here rather than relocated, since
 * this is scaffolding for a future admin-only screen (Phase 15), not
 * a page every logged-in learner should see either.
 */
export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  const roles = await handleListRoles(createListRolesUseCase());

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">
        Roles &amp; Permissions
      </h1>
      {roles.map((role) => (
        <Card key={role.key}>
          <CardHeader>
            <CardTitle className="font-mono text-sm">{role.key}</CardTitle>
          </CardHeader>
          <CardContent>
            {role.description && (
              <p className="mb-3 text-sm text-muted-foreground">{role.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {role.permissionKeys.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No permissions yet (reserved role)
                </span>
              ) : (
                role.permissionKeys.map((permissionKey) => (
                  <Badge key={permissionKey} variant="secondary">
                    {permissionKey}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
