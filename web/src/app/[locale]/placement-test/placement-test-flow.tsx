"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AssessmentItem, CefrLevel, PlacementScore } from "@/modules/assessment/interface/types";
import { SelfAssessmentStage } from "./self-assessment-stage";
import { TransitionStage } from "./transition-stage";
import { DiagnosticStage } from "./diagnostic-stage";
import { ResultsStage } from "./results-stage";

type FlowState =
  | { stage: "self_assessment" }
  | { stage: "transition"; selfAssessedLevel: CefrLevel }
  | { stage: "starting"; selfAssessedLevel: CefrLevel }
  | { stage: "diagnostic"; attemptId: string; items: AssessmentItem[] }
  | { stage: "finalizing"; attemptId: string }
  | { stage: "results"; result: PlacementScore }
  | { stage: "error"; message: string; retry: () => void };

export function PlacementTestFlow() {
  const t = useTranslations("PlacementTest.error");
  const [state, setState] = useState<FlowState>({ stage: "self_assessment" });

  // Doc 08 §3.3: "exits only on completion or explicit abandon-
  // confirmation" — warns on tab close/refresh while an attempt is
  // in progress, so progress loss is never silent.
  useEffect(() => {
    const inProgress = state.stage === "diagnostic" || state.stage === "starting" || state.stage === "finalizing";
    if (!inProgress) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.stage]);

  async function startAttempt(selfAssessedLevel: CefrLevel) {
    setState({ stage: "starting", selfAssessedLevel });
    try {
      const response = await fetch("/api/v1/assessment-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfAssessedLevel }),
      });
      if (!response.ok) throw new Error("start-failed");
      const data = (await response.json()) as { attemptId: string; items: AssessmentItem[] };
      setState({ stage: "diagnostic", attemptId: data.attemptId, items: data.items });
    } catch {
      setState({
        stage: "error",
        message: t("startFailed"),
        retry: () => startAttempt(selfAssessedLevel),
      });
    }
  }

  async function finalizeAttempt(attemptId: string) {
    setState({ stage: "finalizing", attemptId });
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${attemptId}/submit`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("finalize-failed");
      const data = (await response.json()) as { result: PlacementScore };
      setState({ stage: "results", result: data.result });
    } catch {
      setState({
        stage: "error",
        message: t("finalizeFailed"),
        retry: () => finalizeAttempt(attemptId),
      });
    }
  }

  switch (state.stage) {
    case "self_assessment":
      return (
        <SelfAssessmentStage
          onComplete={(level) => setState({ stage: "transition", selfAssessedLevel: level })}
        />
      );

    case "transition":
      return <TransitionStage onStart={() => startAttempt(state.selfAssessedLevel)} />;

    case "starting":
      return <LoadingCard />;

    case "diagnostic":
      return (
        <DiagnosticStage
          attemptId={state.attemptId}
          items={state.items}
          onComplete={() => finalizeAttempt(state.attemptId)}
        />
      );

    case "finalizing":
      return <LoadingCard />;

    case "results":
      return <ResultsStage result={state.result} />;

    case "error":
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
