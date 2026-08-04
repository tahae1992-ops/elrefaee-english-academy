"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AssessmentItem } from "@/modules/assessment/interface/types";

/** Real audio, zero infrastructure: the browser's own Web Speech API synthesizes `audioText` aloud — no Storage/media pipeline needed at this MVP scope. */
function playAudio(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function DiagnosticStage({
  attemptId,
  items,
  onComplete,
}: {
  attemptId: string;
  items: AssessmentItem[];
  onComplete: () => void;
}) {
  const t = useTranslations("PlacementTest.diagnostic");
  const tError = useTranslations("PlacementTest.error");
  const [index, setIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items[index];
  const prompt = item.prompt as {
    prompt: string;
    passage?: string;
    audioText?: string;
    options?: string[];
  };

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
      if (index + 1 < items.length) {
        setIndex(index + 1);
      } else {
        onComplete();
      }
    } catch {
      setError(tError("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const isSpeaking = item.itemType === "free_text";
  const canSubmit = isSpeaking || selectedOptionIndex !== null;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="gap-3">
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {t("progress", { current: index + 1, total: items.length })}
        </p>
        <Progress value={((index + 1) / items.length) * 100} aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prompt.passage && (
          <p className="rounded-md bg-muted p-3 text-sm">{prompt.passage}</p>
        )}

        {prompt.audioText && (
          <Button
            type="button"
            variant="outline"
            onClick={() => playAudio(prompt.audioText!)}
            className="w-fit"
          >
            <Volume2 className="size-4" aria-hidden="true" />
            {t("playAudio")}
          </Button>
        )}

        <p className="text-base font-medium">{prompt.prompt}</p>

        {isSpeaking ? (
          <Textarea
            value={freeTextAnswer}
            onChange={(event) => setFreeTextAnswer(event.target.value)}
            placeholder={t("speakingPlaceholder")}
            rows={4}
          />
        ) : (
          <RadioGroup
            // Always controlled (never `undefined`) — switching a
            // controlled input to uncontrolled between items (which
            // `undefined` does) is a documented React anti-pattern
            // that also desynced Radix's own selection state here.
            value={selectedOptionIndex !== null ? String(selectedOptionIndex) : ""}
            onValueChange={(value) => setSelectedOptionIndex(Number(value))}
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
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => submit({ skipped: true })}
            >
              {t("speakingSkip")}
            </Button>
          )}
          <Button
            disabled={!canSubmit || submitting}
            className="flex-1"
            onClick={() =>
              submit(
                isSpeaking
                  ? { text: freeTextAnswer, skipped: false }
                  : { selectedOptionIndex },
              )
            }
          >
            {submitting ? t("submitting") : t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
