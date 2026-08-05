"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ClientLessonBlock } from "@/modules/curriculum/interface/types";
import type { BlockInteractionRecord } from "./block-interaction";
import { ExercisePractice } from "./exercise-renderer";

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
  onSubmitExercise,
  onShowExerciseAnswer,
  onRetryExercise,
  submittingExerciseId,
  onSubmitTask,
}: {
  block: ClientLessonBlock;
  interaction: BlockInteractionRecord | undefined;
  onSubmitExercise: (exerciseId: string, response: Record<string, unknown>, latencyMs: number) => void;
  onShowExerciseAnswer: (exerciseId: string) => void;
  onRetryExercise: (exerciseId: string) => void;
  submittingExerciseId: string | null;
  onSubmitTask: (text: string) => void;
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
        {block.exercises.map(({ id, exercise }) => (
          <ExercisePractice
            key={id}
            exercise={exercise}
            attempt={interaction?.exerciseAttempts?.[id]}
            submitting={submittingExerciseId === id}
            onSubmit={(response, latencyMs) => onSubmitExercise(id, response, latencyMs)}
            onShowAnswer={() => onShowExerciseAnswer(id)}
            onRetry={() => onRetryExercise(id)}
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
        {block.targetVocabulary.map(({ id, entry }) => (
          <Badge key={id} variant="secondary">
            {entry.headword}
          </Badge>
        ))}
      </div>
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
