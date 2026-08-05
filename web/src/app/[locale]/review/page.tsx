import { redirect } from "@/i18n/navigation";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { resolveDueReviewQueue } from "@/lib/resolve-due-review-queue";
import { ReviewSession } from "./review-session";

const MAX_SESSION_SIZE = 50;

/**
 * doc 08 §3.13 "Flashcards" — full-focus, no app chrome (outside the
 * (app) route group, same reasoning as Lesson View/Placement Test): "a
 * review session is inherently single-focus."
 */
export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  const { items } = await resolveDueReviewQueue(current.userId, new Date(), MAX_SESSION_SIZE);

  return <ReviewSession items={items} />;
}
