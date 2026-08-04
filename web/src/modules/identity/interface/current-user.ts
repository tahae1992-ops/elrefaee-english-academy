import { cache } from "react";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server-client";
import { createGetDashboardDataUseCase } from "@/composition-root";
import type { DashboardData } from "@/modules/identity/application/use-cases/get-dashboard-data.use-case";
// Re-exported so UI code can reference the CEFR type without reaching
// past this Interface-layer module into Application internals
// (arch-check's no-cross-module-reach-into-internals rule, SAD §4).
export type { CefrLevel } from "@/modules/identity/application/ports/user-profile-repository-port";

export interface CurrentUserWithDashboardData {
  userId: string;
  email: string;
  dashboardData: DashboardData;
}

/**
 * `(app)/layout.tsx` (auth guard + TopNav's display name) and
 * `(app)/dashboard/page.tsx` (the widgets) both need this same data
 * within one request — `React.cache` dedupes it to a single DB round
 * trip per request instead of two, the standard App Router pattern
 * for data shared between a layout and its page.
 */
export const getCurrentUserWithDashboardData = cache(
  async (): Promise<CurrentUserWithDashboardData | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const dashboardData = await createGetDashboardDataUseCase().execute(user.id);
    if (!dashboardData) {
      return null;
    }

    return { userId: user.id, email: user.email ?? "", dashboardData };
  },
);
