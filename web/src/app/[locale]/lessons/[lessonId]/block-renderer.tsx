"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClientLessonBlock } from "@/modules/curriculum/interface/types";
import type { BlockInteractionRecord } from "./block-interaction";

const BLOCK_ACCENT: Record<ClientLessonBlock["type"], string> = {
  warm_up: "border-l-muted-foreground/40",
  presentation: "border-l-primary",
  controlled_practice: "border-l-info",
  communicative_task: "border-l-accent-foreground",
  wrap_up: "border-l-success",
};

export function blockAccentClass(type: ClientLessonBlock["type"]): string {
  return BLOCK_ACCENT[type];
}

export function BlockRenderer({
  block,
  interaction,
  onCheckPracticeAnswer,
  onSubmitTask,
  checkingExerciseIndex,
}: {
  block: ClientLessonBlock;
  interaction: BlockInteractionRecord | undefined;
  onCheckPracticeAnswer: (exerciseIndex: number, selectedOptionIndex: number) => void;
  onSubmitTask: (text: string) => void;
  checkingExerciseIndex: number | null;
}) {
  const t = useTranslations("Lesson.blocks");

  if (block.type === "warm_up") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">{t("warmUp")}</p>
        <p className="text-base font-medium">{block.prompt}</p>
        <p className="text-base leading-[1.7] text-muted-foreground">{block.content}</p>
      </div>
    );
  }

  if (block.type === "presentation") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-primary uppercase">{t("presentation")}</p>
        <p className="text-base leading-[1.7]">{block.explanation}</p>
        <ul className="flex flex-col gap-1.5 rounded-md bg-muted p-3">
          {block.examples.map((example, index) => (
            <li key={index} className="text-sm italic text-muted-foreground">
              {example}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "controlled_practice") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.06em] text-info uppercase">{t("controlledPractice")}</p>
        <p className="text-sm text-muted-foreground">{block.instructions}</p>
        {block.exercises.map((exercise, exerciseIndex) => (
          <PracticeExerciseView
            key={exerciseIndex}
            prompt={exercise.prompt}
            options={exercise.options}
            answer={interaction?.practiceAnswers?.[exerciseIndex]}
            checking={checkingExerciseIndex === exerciseIndex}
            onCheck={(selectedOptionIndex) => onCheckPracticeAnswer(exerciseIndex, selectedOptionIndex)}
          />
        ))}
      </div>
    );
  }

  if (block.type === "communicative_task") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground uppercase">{t("communicativeTask")}</p>
        <p className="text-sm text-muted-foreground">{block.instructions}</p>
        <p className="text-base font-medium">{block.prompt}</p>
        <TaskSubmissionView submission={interaction?.taskSubmission} onSubmit={onSubmitTask} />
      </div>
    );
  }

  // wrap_up
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-[0.06em] text-success uppercase">{t("wrapUp")}</p>
      <p className="text-base leading-[1.7]">{block.summary}</p>
      <div className="flex flex-wrap gap-2">
        {block.targetVocabulary.map((word) => (
          <Badge key={word} variant="secondary">
            {word}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PracticeExerciseView({
  prompt,
  options,
  answer,
  checking,
  onCheck,
}: {
  prompt: string;
  options: string[];
  answer: { selectedOptionIndex: number; isCorrect: boolean; correctOptionIndex: number } | undefined;
  checking: boolean;
  onCheck: (selectedOptionIndex: number) => void;
}) {
  const t = useTranslations("Lesson.blocks");
  const [selected, setSelected] = useState("");
  const isAnswered = answer !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3",
        isAnswered && answer.isCorrect && "border-success bg-success-bg",
        isAnswered && !answer.isCorrect && "border-destructive bg-destructive/5",
      )}
    >
      <p className="text-sm font-medium">{prompt}</p>
      <RadioGroup
        value={isAnswered ? String(answer.selectedOptionIndex) : selected}
        onValueChange={setSelected}
        className="flex flex-col gap-2"
      >
        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center gap-2">
            <RadioGroupItem value={String(optionIndex)} id={`opt-${prompt}-${optionIndex}`} disabled={isAnswered} />
            <Label htmlFor={`opt-${prompt}-${optionIndex}`} className="cursor-pointer font-normal">
              {option}
            </Label>
            {isAnswered && optionIndex === answer.correctOptionIndex && (
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            )}
            {isAnswered && optionIndex === answer.selectedOptionIndex && !answer.isCorrect && (
              <XCircle className="size-4 text-destructive" aria-hidden="true" />
            )}
          </div>
        ))}
      </RadioGroup>
      {!isAnswered && (
        <Button size="sm" className="w-fit" disabled={!selected || checking} onClick={() => onCheck(Number(selected))}>
          {checking ? t("checking") : t("checkAnswer")}
        </Button>
      )}
      {isAnswered && (
        <p className={cn("text-xs font-medium", answer.isCorrect ? "text-success" : "text-destructive")}>
          {answer.isCorrect ? t("correct") : t("incorrect")}
        </p>
      )}
    </div>
  );
}

function TaskSubmissionView({ submission, onSubmit }: { submission: string | undefined; onSubmit: (text: string) => void }) {
  const t = useTranslations("Lesson.blocks");
  const [text, setText] = useState(submission ?? "");

  if (submission !== undefined) {
    return (
      <div className="rounded-md border border-success bg-success-bg p-3">
        <p className="mb-1 text-xs font-medium text-success">{t("taskSubmitted")}</p>
        <p className="text-sm whitespace-pre-wrap">{submission}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder={t("taskPlaceholder")} />
      <Button size="sm" className="w-fit" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>
        {t("submitTask")}
      </Button>
    </div>
  );
}
