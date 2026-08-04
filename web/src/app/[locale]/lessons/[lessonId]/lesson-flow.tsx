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
}

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
  const [checkingExercise, setCheckingExercise] = useState<number | null>(null);
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

  async function checkPracticeAnswer(exerciseIndex: number, selectedOptionIndex: number) {
    if (currentBlock.type !== "controlled_practice") return;
    setCheckingExercise(exerciseIndex);
    setError(null);
    try {
      const response = await fetch(`/api/v1/lessons/${lesson.id}/practice-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockIndex, exerciseIndex, selectedOptionIndex }),
      });
      if (!response.ok) throw new Error("check-failed");
      const data = (await response.json()) as { isCorrect: boolean; correctOptionIndex: number };

      setInteractions((prev) => {
        const existing = prev[blockIndex]?.practiceAnswers ?? {};
        const updatedAnswers = { ...existing, [exerciseIndex]: { selectedOptionIndex, ...data } };
        const allAnswered = currentBlock.type === "controlled_practice" && Object.keys(updatedAnswers).length === currentBlock.exercises.length;
        return { ...prev, [blockIndex]: { done: allAnswered, practiceAnswers: updatedAnswers } };
      });
    } catch {
      setError(t("error.checkFailed"));
    } finally {
      setCheckingExercise(null);
    }
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
                onCheckPracticeAnswer={checkPracticeAnswer}
                onSubmitTask={submitTask}
                checkingExerciseIndex={checkingExercise}
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
}: {
  courseId: string;
  unitId: string;
  unitCompleted: boolean;
  hasNextUnit: boolean;
}) {
  const t = useTranslations("Lesson.complete");

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
    </main>
  );
}
