import { getTranslations } from "next-intl/server";
import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveDueReviewQueue } from "@/lib/resolve-due-review-queue";

/**
 * Doc 08 §3.4: "due-review count" on the Dashboard, and §3.13:
 * "Flashcards launched from... the Dashboard's review widget." An
 * async Server Component (not fed via DashboardPage's props) since
 * it's the first Dashboard card with a genuine data need of its own —
 * `getCurrentUserWithDashboardData()` is React.cache-deduped, so this
 * doesn't add a second auth/profile query.
 */
export async function PendingReviewsCard({ userId }: { userId: string }) {
  const t = await getTranslations("Dashboard.pendingReviews");
  const { dueCount } = await resolveDueReviewQueue(userId, new Date(), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {dueCount > 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <BookMarked className="size-8 text-info" aria-hidden="true" />
            <p className="text-2xl font-semibold text-foreground">{t("dueCount", { count: dueCount })}</p>
            <Button asChild size="sm">
              <Link href="/review">{t("startReview")}</Link>
            </Button>
          </div>
        ) : (
          <EmptyState icon={BookMarked} title={t("caughtUpTitle")} description={t("caughtUpDescription")} />
        )}
      </CardContent>
    </Card>
  );
}
