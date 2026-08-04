import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { Logo } from "@/components/logo";
import { PlacementTestFlow } from "./placement-test-flow";

/**
 * Doc 08 §3.3 / doc 09 §5.3: "a contained flow" — deliberately no app
 * chrome (no TopNav/Sidebar), unlike (app)/dashboard. Sits outside the
 * (app) route group for that reason, same as Login/Register.
 */
export default async function PlacementTestPage({
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
    redirect({ href: "/login", locale });
    return;
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-center border-b border-border px-4">
        <Logo variant="mark" className="h-6 w-6" />
      </header>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <PlacementTestFlow />
      </div>
    </main>
  );
}
