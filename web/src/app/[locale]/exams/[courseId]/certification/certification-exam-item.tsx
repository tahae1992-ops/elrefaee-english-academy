"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AssessmentItem } from "@/modules/assessment/interface/types";

/**
 * Wireframe §4.14 Exam's "assessment variant": formal register, no
 * per-item feedback -- distinct from the practice-context immediate
 * feedback CheckpointQuizItem gives (doc 08 §3.9). Submitting an
 * answer both records it AND advances -- there's no separate
 * feedback step to dismiss.
 *
 * Speaking (`free_text`) items -- ungraded at MVP, same disclosed gap
 * as Placement's DiagnosticStage -- use the identical Textarea +
 * skip pattern rather than a radio group.
 */
export function CertificationExamItem({
  attemptId,
  item,
  index,
  total,
  onAdvance,
}: {
  attemptId: string;
  item: AssessmentItem;
  index: number;
  total: number;
  onAdvance: () => void;
}) {
  const tQuiz = useTranslations("Quiz");
  const tExam = useTranslations("Exam");
  const tDiagnostic = useTranslations("PlacementTest.diagnostic");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompt = item.prompt as { prompt: string; options?: string[] };
  const isSpeaking = item.itemType === "free_text";
  const canSubmit = isSpeaking || selectedOptionIndex !== null;

  async function submit(responsePayload: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${attemptId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, responsePayload }),
      });
      if (!response.ok) throw new Error("submit-failed");
      setSelectedOptionIndex(null);
      setFreeTextAnswer("");
      onAdvance();
    } catch {
      setError(tQuiz("error.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="gap-3">
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {tExam("itemProgress", { current: index + 1, total })}
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

        {isSpeaking ? (
          <Textarea
            value={freeTextAnswer}
            onChange={(event) => setFreeTextAnswer(event.target.value)}
            placeholder={tDiagnostic("speakingPlaceholder")}
            rows={4}
            disabled={submitting}
          />
        ) : (
          <RadioGroup
            value={selectedOptionIndex !== null ? String(selectedOptionIndex) : ""}
            onValueChange={(value) => setSelectedOptionIndex(Number(value))}
            disabled={submitting}
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
        )}

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Button type="button" variant="ghost" disabled={submitting} onClick={() => submit({ skipped: true })}>
              {tDiagnostic("speakingSkip")}
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={!canSubmit || submitting}
            onClick={() => submit(isSpeaking ? { text: freeTextAnswer, skipped: false } : { selectedOptionIndex })}
          >
            {submitting ? tQuiz("submitting") : index + 1 < total ? tExam("submitAndNext") : tExam("submitAndFinish")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
