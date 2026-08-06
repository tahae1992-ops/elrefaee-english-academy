"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { AssessmentItem } from "@/modules/assessment/interface/types";

interface Feedback {
  isCorrect: boolean | null;
  explanation?: string;
}

/**
 * doc 08 §3.9 Quiz's exact behavior: submit an answer, see immediate
 * correct/incorrect + explanation feedback, then Next — distinct from
 * Placement Test's DiagnosticStage, which withholds this (doc 09 §5.3).
 */
export function CheckpointQuizItem({
  attemptId,
  item,
  index,
  total,
  onNext,
}: {
  attemptId: string;
  item: AssessmentItem;
  index: number;
  total: number;
  onNext: () => void;
}) {
  const t = useTranslations("Lesson.exercises");
  const tQuiz = useTranslations("Quiz");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompt = item.prompt as { prompt: string; options?: string[] };

  async function submit() {
    if (selectedOptionIndex === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${attemptId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, responsePayload: { selectedOptionIndex } }),
      });
      if (!response.ok) throw new Error("submit-failed");
      const data = (await response.json()) as Feedback;
      setFeedback(data);
    } catch {
      setError(tQuiz("error.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setSelectedOptionIndex(null);
    setFeedback(null);
    onNext();
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="gap-3">
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {tQuiz("progress", { current: index + 1, total })}
        </p>
        <Progress value={((index + 1) / total) * 100} aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-base font-medium">{prompt.prompt}</p>

        <RadioGroup
          value={selectedOptionIndex !== null ? String(selectedOptionIndex) : ""}
          onValueChange={(value) => setSelectedOptionIndex(Number(value))}
          disabled={feedback !== null}
          aria-label={prompt.prompt}
          className="flex flex-col gap-2"
        >
          {prompt.options?.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-3">
              <RadioGroupItem value={String(optionIndex)} id={`option-${optionIndex}`} />
              <Label htmlFor={`option-${optionIndex}`} className="cursor-pointer font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {feedback && (
          <div
            role="status"
            className={cn("rounded-md border p-3 text-sm", feedback.isCorrect ? "border-success bg-success-bg" : "border-destructive bg-destructive/5")}
          >
            <p className={cn("font-medium", feedback.isCorrect ? "text-success" : "text-destructive")}>
              {feedback.isCorrect ? t("correct") : t("incorrect")}
            </p>
            {feedback.explanation && <p className="mt-1 text-muted-foreground">{feedback.explanation}</p>}
          </div>
        )}

        {feedback ? (
          <Button className="w-full" onClick={next}>
            {tQuiz("next")}
          </Button>
        ) : (
          <Button className="w-full" disabled={selectedOptionIndex === null || submitting} onClick={submit}>
            {submitting ? tQuiz("submitting") : tQuiz("submitAnswer")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
