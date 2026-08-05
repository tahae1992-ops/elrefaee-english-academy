"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import type { ClientReviewQueueItem } from "@/lib/resolve-due-review-queue";

type ReviewRating = "again" | "hard" | "good" | "easy";

interface SubmitReviewResponseApiResult {
  xpAwarded: number;
}

const RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];

/**
 * doc 08 §3.13 "Flashcards": "one card at a time, front (question) →
 * reveal → four recall-quality buttons (EDD §16 — never a binary
 * right/wrong)." Front = headword only (production/recall first,
 * matching EDD §16's retrieval-over-recognition philosophy); reveal
 * shows the full authored entry.
 */
export function ReviewSession({ items }: { items: ClientReviewQueueItem[] }) {
  const t = useTranslations("Review");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submittingRating, setSubmittingRating] = useState<ReviewRating | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionXp, setSessionXp] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [done, setDone] = useState(items.length === 0);

  const current = items[index];

  async function submitRating(rating: ReviewRating) {
    setSubmittingRating(rating);
    setError(null);
    try {
      const response = await fetch("/api/v1/review/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyEntryId: current.vocabularyEntryId, rating, clientEventId: crypto.randomUUID() }),
      });
      if (!response.ok) throw new Error("Request failed");
      const result: SubmitReviewResponseApiResult = await response.json();

      setSessionXp((xp) => xp + result.xpAwarded);
      setReviewedCount((count) => count + 1);
      if (index + 1 >= items.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setRevealed(false);
      }
    } catch {
      setError(t("error.submitFailed"));
    } finally {
      setSubmittingRating(null);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
        <Logo variant="mark" className="h-8 w-8" />
        <h1 className="text-2xl font-bold">{reviewedCount > 0 ? t("summary.title") : t("emptyState.title")}</h1>
        <p className="max-w-xs text-muted-foreground">
          {reviewedCount > 0 ? t("summary.description", { count: reviewedCount }) : t("emptyState.description")}
        </p>
        {sessionXp > 0 && <p className="text-lg font-semibold text-warning">{t("summary.xpEarned", { count: sessionXp })}</p>}
        <Button asChild>
          <Link href="/dashboard">{t("summary.backToDashboard")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Logo variant="mark" className="h-6 w-6" />
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:underline">
            {t("exit")}
          </Link>
        </div>
        <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
          {t("progress", { current: index + 1, total: items.length })}
        </p>
        <Progress value={(index / items.length) * 100} className="h-1" aria-hidden="true" />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="flex-1">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <Badge variant="secondary">{current.entry.partOfSpeech}</Badge>
            <p className="text-3xl font-bold">{current.entry.headword}</p>

            {!revealed ? (
              <Button onClick={() => setRevealed(true)} className="mt-4">
                {t("reveal")}
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-3 text-left">
                <p className="text-center text-muted-foreground">{current.entry.ipaTranscription}</p>
                <ul className="flex flex-col gap-1.5 rounded-md bg-muted p-3">
                  {current.entry.exampleSentences.map((sentence, sentenceIndex) => (
                    <li key={sentenceIndex} className="text-sm italic text-muted-foreground">
                      {sentence.text}
                    </li>
                  ))}
                </ul>
                {current.entry.synonyms.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("synonyms")}: {current.entry.synonyms.join(", ")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {revealed && (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((rating) => (
              <Button
                key={rating}
                variant={rating === "easy" ? "default" : "outline"}
                disabled={submittingRating !== null}
                onClick={() => submitRating(rating)}
              >
                {t(`rating.${rating}`)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
