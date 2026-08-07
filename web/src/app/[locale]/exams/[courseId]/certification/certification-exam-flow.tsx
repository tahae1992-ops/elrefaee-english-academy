"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AssessmentItem } from "@/modules/assessment/interface/types";
import type { FinalizeCertificationAttemptResult } from "@/modules/assessment/interface/types";
import { CertificationExamItem } from "./certification-exam-item";
import { CertificationExamResults } from "./certification-exam-results";

type FlowState =
  | { stage: "loading" }
  | { stage: "exam"; attemptId: string; items: AssessmentItem[]; index: number; deadline: number }
  | { stage: "finalizing"; attemptId: string }
  | { stage: "results"; result: FinalizeCertificationAttemptResult }
  | { stage: "error"; message: string; retry: () => void };

export function CertificationExamFlow({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const t = useTranslations("Exam.error");
  const [state, setState] = useState<FlowState>({ stage: "loading" });

  useEffect(() => {
    void startAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const inProgress = state.stage === "exam" || state.stage === "finalizing";
    if (!inProgress) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.stage]);

  // Wireframe §4.14: a countdown that auto-submits whatever's been
  // answered when it reaches zero -- a real time limit, not decorative.
  useEffect(() => {
    if (state.stage !== "exam") return;
    const interval = setInterval(() => {
      if (Date.now() >= state.deadline) {
        void finalizeAttempt(state.attemptId);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage, state.stage === "exam" ? state.attemptId : null, state.stage === "exam" ? state.deadline : null]);

  async function startAttempt() {
    setState({ stage: "loading" });
    try {
      const response = await fetch(`/api/v1/exams/${courseId}/certification`);
      if (!response.ok) {
        if (response.status === 429) {
          const data = (await response.json()) as { unlockAt: string };
          const unlockDate = new Date(data.unlockAt);
          throw new CooldownActiveError(unlockDate);
        }
        throw new Error("start-failed");
      }
      const data = (await response.json()) as { attemptId: string; items: AssessmentItem[]; timeLimitMinutes: number };
      setState({
        stage: "exam",
        attemptId: data.attemptId,
        items: data.items,
        index: 0,
        deadline: Date.now() + data.timeLimitMinutes * 60 * 1000,
      });
    } catch (error) {
      const message = error instanceof CooldownActiveError ? t("cooldownActive", { date: error.unlockAt.toLocaleDateString() }) : t("startFailed");
      setState({ stage: "error", message, retry: () => void startAttempt() });
    }
  }

  async function finalizeAttempt(attemptId: string) {
    setState({ stage: "finalizing", attemptId });
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${attemptId}/submit`, { method: "POST" });
      if (!response.ok) throw new Error("finalize-failed");
      const data = (await response.json()) as { result: FinalizeCertificationAttemptResult };
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
    return <CertificationExamResults result={state.result} courseId={courseId} courseTitle={courseTitle} />;
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <ExamTimer deadline={state.deadline} />
      <CertificationExamItem
        attemptId={state.attemptId}
        item={state.items[state.index]}
        index={state.index}
        total={state.items.length}
        onAdvance={() => {
          if (state.index + 1 < state.items.length) {
            setState({ ...state, index: state.index + 1 });
          } else {
            void finalizeAttempt(state.attemptId);
          }
        }}
      />
    </div>
  );
}

class CooldownActiveError extends Error {
  constructor(public readonly unlockAt: Date) {
    super("cooldown-active");
  }
}

function ExamTimer({ deadline }: { deadline: number }) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => setRemainingMs(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <p className="text-center text-sm font-medium text-muted-foreground" aria-live="off">
      {minutes}:{String(seconds).padStart(2, "0")}
    </p>
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
