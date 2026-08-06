"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AssessmentItem, CheckpointScore } from "@/modules/assessment/interface/types";
import { CheckpointQuizItem } from "./checkpoint-quiz-item";
import { CheckpointResults } from "./checkpoint-results";

type FlowState =
  | { stage: "loading" }
  | { stage: "quiz"; attemptId: string; items: AssessmentItem[]; index: number }
  | { stage: "finalizing"; attemptId: string }
  | { stage: "results"; result: CheckpointScore }
  | { stage: "error"; message: string; retry: () => void };

export function CheckpointQuizFlow({ unitId, courseId, unitTitle }: { unitId: string; courseId: string; unitTitle: string }) {
  const t = useTranslations("Quiz.error");
  const [state, setState] = useState<FlowState>({ stage: "loading" });

  useEffect(() => {
    void startAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // doc 08 §3.3's same pattern, applied to the checkpoint: never lose
  // progress silently to an accidental tab close mid-quiz.
  useEffect(() => {
    const inProgress = state.stage === "quiz" || state.stage === "finalizing";
    if (!inProgress) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.stage]);

  async function startAttempt() {
    setState({ stage: "loading" });
    try {
      const response = await fetch(`/api/v1/quizzes/${unitId}/checkpoint`);
      if (!response.ok) throw new Error("start-failed");
      const data = (await response.json()) as { attemptId: string; items: AssessmentItem[] };
      setState({ stage: "quiz", attemptId: data.attemptId, items: data.items, index: 0 });
    } catch {
      setState({ stage: "error", message: t("startFailed"), retry: () => void startAttempt() });
    }
  }

  async function finalizeAttempt(attemptId: string) {
    setState({ stage: "finalizing", attemptId });
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${attemptId}/submit`, { method: "POST" });
      if (!response.ok) throw new Error("finalize-failed");
      const data = (await response.json()) as { result: CheckpointScore };
      setState({ stage: "results", result: data.result });
    } catch {
      setState({ stage: "error", message: t("finalizeFailed"), retry: () => void finalizeAttempt(attemptId) });
    }
  }

  if (state.stage === "loading" || state.stage === "finalizing") {
    return <LoadingCard />;
  }

  if (state.stage === "error") {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Alert variant="destructive" role="alert">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
          <Button onClick={state.retry}>{t("retry")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (state.stage === "results") {
    return <CheckpointResults result={state.result} unitId={unitId} courseId={courseId} unitTitle={unitTitle} onRetry={() => void startAttempt()} />;
  }

  return (
    <CheckpointQuizItem
      attemptId={state.attemptId}
      item={state.items[state.index]}
      index={state.index}
      total={state.items.length}
      onNext={() => {
        if (state.index + 1 < state.items.length) {
          setState({ ...state, index: state.index + 1 });
        } else {
          void finalizeAttempt(state.attemptId);
        }
      }}
    />
  );
}

function LoadingCard() {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col gap-4 py-8">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
