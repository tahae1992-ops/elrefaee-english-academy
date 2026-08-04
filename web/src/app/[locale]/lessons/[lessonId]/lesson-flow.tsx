"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { blockRequiresInteraction } from "@/modules/curriculum/interface/types";
import type { ClientLesson } from "@/modules/curriculum/interface/types";
import { BlockRenderer, blockAccentClass } from "./block-renderer";
import type { BlockInteractions } from "./block-interaction";
import { cn } from "@/lib/utils";

interface CompleteResponse {
  completed: boolean;
  unitCompleted: boolean;
  nextUnitId: string | null;
  nextLessonId: string | null;
}

interface ScoreResponse {
  isCorrect: boolean;
  explanation: string;
  correctAnswer: unknown;
  itemResults?: boolean[];
}

const AUTO_ADVANCE_SECONDS = 5;

export function LessonFlow({
  lesson,
  courseId,
  initialBlockIndex,
  initialBlockInteractions,
}: {
  lesson: ClientLesson;
  courseId: string;
  initialBlockIndex: number;
  initialBlockInteractions: Record<number, unknown>;
}) {
  const t = useTranslations("Lesson");
  const router = useRouter();
  const blocks = lesson.content.blocks;

  const [blockIndex, setBlockIndex] = useState(Math.min(initialBlockIndex, blocks.length - 1));
  const [maxVisited, setMaxVisited] = useState(Math.min(initialBlockIndex, blocks.length - 1));
  const [interactions, setInteractions] = useState<BlockInteractions>(initialBlockInteractions as BlockInteractions);
  const [submittingExerciseId, setSubmittingExerciseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteResponse | null>(null);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!result) event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [result]);

  const currentBlock = blocks[blockIndex];
  const requiresInteraction = blockRequiresInteraction(currentBlock.type);
  const canContinue = !requiresInteraction || interactions[blockIndex]?.done === true;
  const isLastBlock = blockIndex === blocks.length - 1;

  function isBlockFullyDone(index: number, exerciseAttempts: Record<string, { done: boolean }>): boolean {
    const block = blocks[index];
    if (block.type !== "controlled_practice") return true;
    return block.exercises.every(({ id }) => exerciseAttempts[id]?.done === true);
  }

  async function submitExercise(exerciseId: string, response: Record<string, unknown>, latencyMs: number) {
    setSubmittingExerciseId(exerciseId);
    setError(null);
    try {
      const httpResponse = await fetch(`/api/v1/exercises/${exerciseId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, latencyMs, response }),
      });
      if (!httpResponse.ok) throw new Error("attempt-failed");
      const data = (await httpResponse.json()) as ScoreResponse;

      setInteractions((prev) => {
        const existingAttempts = prev[blockIndex]?.exerciseAttempts ?? {};
        const updatedAttempts = {
          ...existingAttempts,
          [exerciseId]: { done: data.isCorrect, isCorrect: data.isCorrect, correctAnswer: data.correctAnswer, explanation: data.explanation, itemResults: data.itemResults },
        };
        return { ...prev, [blockIndex]: { done: isBlockFullyDone(blockIndex, updatedAttempts), exerciseAttempts: updatedAttempts } };
      });
    } catch {
      setError(t("error.checkFailed"));
    } finally {
      setSubmittingExerciseId(null);
    }
  }

  function showExerciseAnswer(exerciseId: string) {
    setInteractions((prev) => {
      const existingAttempts = prev[blockIndex]?.exerciseAttempts ?? {};
      const current = existingAttempts[exerciseId];
      if (!current) return prev;
      const updatedAttempts = { ...existingAttempts, [exerciseId]: { ...current, done: true, revealed: true } };
      return { ...prev, [blockIndex]: { done: isBlockFullyDone(blockIndex, updatedAttempts), exerciseAttempts: updatedAttempts } };
    });
  }

  function retryExercise(exerciseId: string) {
    setInteractions((prev) => {
      const existingAttempts = { ...(prev[blockIndex]?.exerciseAttempts ?? {}) };
      delete existingAttempts[exerciseId];
      return { ...prev, [blockIndex]: { done: isBlockFullyDone(blockIndex, existingAttempts), exerciseAttempts: existingAttempts } };
    });
  }

  function submitTask(text: string) {
    setInteractions((prev) => ({ ...prev, [blockIndex]: { done: true, taskSubmission: text } }));
  }

  async function saveProgress(nextBlockIndex: number, updatedInteractions: BlockInteractions) {
    await fetch(`/api/v1/lessons/${lesson.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIndex: nextBlockIndex, blockInteractions: updatedInteractions }),
    });
  }

  async function handleContinue() {
    setError(null);
    if (isLastBlock) {
      setSubmitting(true);
      try {
        const response = await fetch(`/api/v1/lessons/${lesson.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockIndex, blockInteractions: interactions }),
        });
        if (!response.ok) throw new Error("complete-failed");
        const data = (await response.json()) as CompleteResponse;
        setResult(data);
      } catch {
        setError(t("error.completeFailed"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const next = blockIndex + 1;
      await saveProgress(next, interactions);
      setBlockIndex(next);
      setMaxVisited((prev) => Math.max(prev, next));
    } catch {
      setError(t("error.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveAndExit() {
    setSubmitting(true);
    try {
      await saveProgress(blockIndex, interactions);
    } catch {
      // Non-fatal — the learner is leaving anyway; the last successful save still stands.
    }
    router.push(`/courses/${courseId}/units/${lesson.unitId}`);
  }

  if (result) {
    return (
      <LessonCompleteScreen
        courseId={courseId}
        unitId={lesson.unitId}
        unitCompleted={result.unitCompleted}
        hasNextUnit={result.nextUnitId !== null}
        nextLessonId={result.nextLessonId}
      />
    );
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Logo variant="mark" className="h-6 w-6" />
          <Button variant="ghost" size="sm" disabled={submitting} onClick={handleSaveAndExit}>
            {t("saveAndExit")}
          </Button>
        </div>
        <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
          {t("progress", { current: blockIndex + 1, total: blocks.length })}
        </p>
        <Progress value={((blockIndex + 1) / blocks.length) * 100} className="h-1" aria-hidden="true" />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 gap-8 px-4 py-8 md:px-8">
        <nav className="hidden w-40 shrink-0 flex-col gap-1 md:flex" aria-label={t("outlineLabel")}>
          {blocks.map((block, index) => (
            <button
              key={index}
              type="button"
              disabled={index > maxVisited}
              onClick={() => setBlockIndex(index)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-xs font-medium",
                index === blockIndex ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                index > maxVisited && "cursor-not-allowed opacity-40",
                index <= maxVisited && index !== blockIndex && "hover:bg-muted",
              )}
            >
              {index < blockIndex ? "✓ " : index === blockIndex ? "▸ " : ""}
              {t(`blocks.${block.type === "warm_up" ? "warmUp" : block.type === "controlled_practice" ? "controlledPractice" : block.type === "communicative_task" ? "communicativeTask" : block.type === "wrap_up" ? "wrapUp" : "presentation"}`)}
            </button>
          ))}
        </nav>

        <div className="flex max-w-[640px] flex-1 flex-col gap-6">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className={cn("border-l-4", blockAccentClass(currentBlock.type))}>
            <CardContent className="py-5">
              <BlockRenderer
                block={currentBlock}
                interaction={interactions[blockIndex]}
                onSubmitExercise={submitExercise}
                onShowExerciseAnswer={showExerciseAnswer}
                onRetryExercise={retryExercise}
                submittingExerciseId={submittingExerciseId}
                onSubmitTask={submitTask}
              />
            </CardContent>
          </Card>

          <Button disabled={!canContinue || submitting} onClick={handleContinue} className="w-full">
            {submitting ? t("saving") : isLastBlock ? t("finishLesson") : t("continue")}
          </Button>
        </div>
      </div>
    </main>
  );
}

function LessonCompleteScreen({
  courseId,
  unitId,
  unitCompleted,
  hasNextUnit,
  nextLessonId,
}: {
  courseId: string;
  unitId: string;
  unitCompleted: boolean;
  hasNextUnit: boolean;
  nextLessonId: string | null;
}) {
  const t = useTranslations("Lesson.complete");
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_ADVANCE_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  // Automatic lesson progression (per the requirement): the system has
  // already determined the next lesson server-side (the /complete
  // route's nextLessonId) — this just gives the learner a visible,
  // cancellable countdown rather than yanking them away instantly.
  useEffect(() => {
    if (!nextLessonId || cancelled) return;
    if (secondsLeft <= 0) {
      router.push(`/lessons/${nextLessonId}`);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [nextLessonId, cancelled, secondsLeft, router]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-bg">
        <svg viewBox="0 0 24 24" className="size-8 text-success" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {unitCompleted && hasNextUnit ? t("unitCompleteDescription") : t("description")}
      </p>

      {nextLessonId && !cancelled && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">{t("autoAdvancing", { seconds: secondsLeft })}</p>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/lessons/${nextLessonId}`)}>{t("continueNow")}</Button>
            <Button variant="outline" onClick={() => setCancelled(true)}>
              {t("stayHere")}
            </Button>
          </div>
        </div>
      )}

      {(!nextLessonId || cancelled) && (
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href={`/courses/${courseId}/units/${unitId}`}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              {t("backToUnit")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/courses/${courseId}`}>{t("backToCourse")}</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
