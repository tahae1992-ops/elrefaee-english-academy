"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClientExercise } from "@/modules/curriculum/interface/types";
import type { ExerciseAttemptRecord } from "./block-interaction";

/** Every exercise-type input component reports its response + how long the learner took (SRS FR-07's "latency event"). */
type SubmitFn = (response: Record<string, unknown>, latencyMs: number) => void;

function useLatency() {
  const [shownAt] = useState(() => performance.now());
  return () => Math.round(performance.now() - shownAt);
}

function formatCorrectAnswer(correctAnswer: unknown): string {
  if (typeof correctAnswer === "boolean") return correctAnswer ? "True" : "False";
  if (typeof correctAnswer === "string") return correctAnswer;
  if (Array.isArray(correctAnswer)) {
    return correctAnswer
      .map((item) => (Array.isArray(item) ? `${item[0]} → ${item[1]}` : String(item)))
      .join(Array.isArray(correctAnswer[0]) ? ", " : " → ");
  }
  return String(correctAnswer);
}

function FeedbackPanel({ attempt }: { attempt: ExerciseAttemptRecord }) {
  const t = useTranslations("Lesson.exercises");

  if (attempt.revealed) {
    return (
      <div className="rounded-md border border-border bg-muted p-3 text-sm">
        <p className="font-medium">{t("answerRevealed", { answer: formatCorrectAnswer(attempt.correctAnswer) })}</p>
        {attempt.explanation && <p className="mt-1 text-muted-foreground">{attempt.explanation}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm",
        attempt.isCorrect ? "border-success bg-success-bg" : "border-destructive bg-destructive/5",
      )}
    >
      <p className={cn("font-medium", attempt.isCorrect ? "text-success" : "text-destructive")}>
        {attempt.isCorrect ? t("correct") : t("incorrect")}
      </p>
      {attempt.explanation && <p className="mt-1 text-muted-foreground">{attempt.explanation}</p>}
    </div>
  );
}

function RetryOrReveal({ onRetry, onShowAnswer }: { onRetry: () => void; onShowAnswer: () => void }) {
  const t = useTranslations("Lesson.exercises");
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onRetry}>
        {t("tryAgain")}
      </Button>
      <Button size="sm" variant="ghost" onClick={onShowAnswer}>
        {t("showAnswer")}
      </Button>
    </div>
  );
}

export function ExercisePractice({
  exercise,
  attempt,
  submitting,
  onSubmit,
  onShowAnswer,
  onRetry,
}: {
  exercise: ClientExercise;
  attempt: ExerciseAttemptRecord | undefined;
  submitting: boolean;
  onSubmit: SubmitFn;
  onShowAnswer: () => void;
  onRetry: () => void;
}) {
  const getLatency = useLatency();
  const isDone = attempt?.done === true;
  const isWrongUnresolved = attempt !== undefined && !attempt.done && attempt.isCorrect === false;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <p className="text-sm font-medium">{exercise.prompt}</p>
      <ExerciseInput exercise={exercise} disabled={isDone || submitting} onSubmit={(r) => onSubmit(r, getLatency())} />
      {attempt && <FeedbackPanel attempt={attempt} />}
      {isWrongUnresolved && <RetryOrReveal onRetry={onRetry} onShowAnswer={onShowAnswer} />}
    </div>
  );
}

function ExerciseInput({
  exercise,
  disabled,
  onSubmit,
}: {
  exercise: ClientExercise;
  disabled: boolean;
  onSubmit: (response: Record<string, unknown>) => void;
}) {
  const t = useTranslations("Lesson.exercises");
  // Every response must carry the exerciseType discriminant the API's
  // schema requires (score-exercise.controller.ts's discriminated
  // union) — injected here once rather than in every leaf input.
  const submitWithType = (response: Record<string, unknown>) => onSubmit({ exerciseType: exercise.exerciseType, ...response });

  if (exercise.exerciseType === "multiple_choice") {
    return <MultipleChoiceInput options={exercise.options} disabled={disabled} onSubmit={submitWithType} />;
  }
  if (exercise.exerciseType === "true_false") {
    return <TrueFalseInput disabled={disabled} onSubmit={submitWithType} />;
  }
  if (exercise.exerciseType === "fill_in_blank" || exercise.exerciseType === "short_answer") {
    return <TextInput disabled={disabled} onSubmit={submitWithType} placeholder={t("typeYourAnswer")} />;
  }
  if (exercise.exerciseType === "matching") {
    return <MatchingInput leftItems={exercise.leftItems} rightItems={exercise.rightItems} disabled={disabled} onSubmit={submitWithType} />;
  }
  // ordering / sentence_building share one interaction (see SequenceBuilderInput).
  const items = exercise.exerciseType === "ordering" ? exercise.shuffledItems : exercise.shuffledChunks;
  return <SequenceBuilderInput items={items} disabled={disabled} onSubmit={submitWithType} />;
}

function MultipleChoiceInput({ options, disabled, onSubmit }: { options: string[]; disabled: boolean; onSubmit: (r: Record<string, unknown>) => void }) {
  const t = useTranslations("Lesson.exercises");
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <RadioGroup value={selected} onValueChange={setSelected} className="flex flex-col gap-2" aria-disabled={disabled}>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <RadioGroupItem value={String(index)} id={`mc-${index}-${option}`} disabled={disabled} />
            <Label htmlFor={`mc-${index}-${option}`} className="cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {!disabled && (
        <Button size="sm" className="w-fit" disabled={!selected} onClick={() => onSubmit({ selectedOptionIndex: Number(selected) })}>
          {t("submit")}
        </Button>
      )}
    </div>
  );
}

function TrueFalseInput({ disabled, onSubmit }: { disabled: boolean; onSubmit: (r: Record<string, unknown>) => void }) {
  const t = useTranslations("Lesson.exercises");
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onSubmit({ submittedAnswer: true })}>
        {t("true")}
      </Button>
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onSubmit({ submittedAnswer: false })}>
        {t("false")}
      </Button>
    </div>
  );
}

function TextInput({ disabled, onSubmit, placeholder }: { disabled: boolean; onSubmit: (r: Record<string, unknown>) => void; placeholder: string }) {
  const t = useTranslations("Lesson.exercises");
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} disabled={disabled} className="max-w-xs" />
      {!disabled && (
        <Button size="sm" disabled={!text.trim()} onClick={() => onSubmit({ submittedText: text.trim() })}>
          {t("submit")}
        </Button>
      )}
    </div>
  );
}

/** doc 07 §5.12's matching pattern: tap-to-select, tap-to-place — the same interaction *is* the WCAG 2.2 keyboard-operable alternative, not a fallback for a separate drag implementation. */
function MatchingInput({
  leftItems,
  rightItems,
  disabled,
  onSubmit,
}: {
  leftItems: string[];
  rightItems: string[];
  disabled: boolean;
  onSubmit: (r: Record<string, unknown>) => void;
}) {
  const t = useTranslations("Lesson.exercises");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<[string, string][]>([]);

  const matchedLeft = new Set(pairs.map(([left]) => left));
  const matchedRight = new Set(pairs.map(([, right]) => right));

  function selectLeft(left: string) {
    if (disabled || matchedLeft.has(left)) return;
    setSelectedLeft(left);
  }

  function selectRight(right: string) {
    if (disabled || matchedRight.has(right) || !selectedLeft) return;
    setPairs((prev) => [...prev, [selectedLeft, right]]);
    setSelectedLeft(null);
  }

  function unpair(left: string) {
    if (disabled) return;
    setPairs((prev) => prev.filter(([l]) => l !== left));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          {leftItems.map((left) => (
            <button
              key={left}
              type="button"
              disabled={disabled || matchedLeft.has(left)}
              onClick={() => (matchedLeft.has(left) ? unpair(left) : selectLeft(left))}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left text-sm",
                matchedLeft.has(left) && "border-success bg-success-bg text-success",
                selectedLeft === left && "border-primary bg-accent",
                !matchedLeft.has(left) && selectedLeft !== left && "border-border hover:bg-muted",
              )}
            >
              {left}
              {matchedLeft.has(left) && ` → ${pairs.find(([l]) => l === left)?.[1]}`}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {rightItems.map((right) => (
            <button
              key={right}
              type="button"
              disabled={disabled || matchedRight.has(right) || !selectedLeft}
              onClick={() => selectRight(right)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left text-sm",
                matchedRight.has(right) ? "border-success bg-success-bg text-success" : "border-border hover:bg-muted",
                !selectedLeft && !matchedRight.has(right) && "opacity-60",
              )}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
      {!disabled && (
        <Button
          size="sm"
          className="w-fit"
          disabled={pairs.length !== leftItems.length}
          onClick={() => onSubmit({ matchedPairs: pairs })}
        >
          {t("submit")}
        </Button>
      )}
    </div>
  );
}

/** Shared by ordering + sentence_building: tap items from the pool into a built sequence, tap a placed item to remove it. */
function SequenceBuilderInput({ items, disabled, onSubmit }: { items: string[]; disabled: boolean; onSubmit: (r: Record<string, unknown>) => void }) {
  const t = useTranslations("Lesson.exercises");
  const [built, setBuilt] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  function place(item: string, index: number) {
    if (disabled || usedIndices.has(index)) return;
    setBuilt((prev) => [...prev, item]);
    setUsedIndices((prev) => new Set(prev).add(index));
  }

  function removeAt(builtIndex: number) {
    if (disabled) return;
    setBuilt((prev) => prev.filter((_, i) => i !== builtIndex));
    // Reset pool availability by rebuilding usedIndices from the remaining built items (handles duplicate words correctly).
    const remaining = built.filter((_, i) => i !== builtIndex);
    const nextUsed = new Set<number>();
    for (const word of remaining) {
      const idx = items.findIndex((candidate, i) => candidate === word && !nextUsed.has(i));
      if (idx !== -1) nextUsed.add(idx);
    }
    setUsedIndices(nextUsed);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-10 flex-wrap gap-2 rounded-md border border-dashed border-border p-2">
        {built.length === 0 && <span className="text-xs text-muted-foreground">{t("tapWordsBelow")}</span>}
        {built.map((word, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => removeAt(index)}
            className="rounded-md border border-primary bg-accent px-2.5 py-1 text-sm text-accent-foreground"
          >
            {word}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled || usedIndices.has(index)}
            onClick={() => place(item, index)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm",
              usedIndices.has(index) ? "cursor-not-allowed border-border/50 text-muted-foreground/40" : "border-border hover:bg-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {!disabled && (
        <Button size="sm" className="w-fit" disabled={built.length !== items.length} onClick={() => onSubmit({ submittedOrder: built })}>
          {t("submit")}
        </Button>
      )}
    </div>
  );
}
