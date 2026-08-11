"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ClientLessonBlock, ClientMaterial } from "@/modules/curriculum/interface/types";
import type { BlockInteractionRecord } from "./block-interaction";
import { ExercisePractice } from "./exercise-renderer";

const BLOCK_ACCENT: Record<ClientLessonBlock["type"], string> = {
  warm_up: "border-l-muted-foreground/40",
  presentation: "border-l-primary",
  vocabulary: "border-l-primary",
  video: "border-l-info",
  reading: "border-l-primary",
  listening: "border-l-info",
  controlled_practice: "border-l-info",
  speaking_practice: "border-l-accent-foreground",
  communicative_task: "border-l-accent-foreground",
  quiz: "border-l-warning",
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

  if (block.type === "vocabulary") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-primary uppercase">{t("vocabulary")}</p>
        <p className="text-sm text-muted-foreground">{block.instructions}</p>
        <div className="flex flex-col gap-3">
          {block.vocabulary.map(({ id, entry }) => (
            <div key={id} className="rounded-md border border-border p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold">{entry.headword}</span>
                <span className="text-sm text-muted-foreground">/{entry.ipaTranscription}/</span>
                <span className="text-xs text-muted-foreground italic">{entry.partOfSpeech}</span>
              </div>
              {entry.exampleSentences[0] && (
                <p className="mt-1 text-sm text-muted-foreground italic">{entry.exampleSentences[0].text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-info uppercase">{t("video")}</p>
        <p className="text-base font-medium">{block.title}</p>
        <p className="text-sm text-muted-foreground">{block.instructions}</p>
        <MaterialEmbed material={block.material.material} />
      </div>
    );
  }

  if (block.type === "reading") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-primary uppercase">{t("reading")}</p>
        <p className="text-base font-medium">{block.title}</p>
        <p className="text-base leading-[1.7] whitespace-pre-wrap">{block.passage}</p>
        {block.glossary.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {block.glossary.map(({ id, entry }) => (
              <Badge key={id} variant="secondary">
                {entry.headword}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "listening") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-info uppercase">{t("listening")}</p>
        <p className="text-base font-medium">{block.title}</p>
        <MaterialEmbed material={block.material.material} />
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground">{t("showTranscript")}</summary>
          <p className="mt-2 leading-[1.7] whitespace-pre-wrap text-muted-foreground">{block.transcript}</p>
        </details>
      </div>
    );
  }

  if (block.type === "controlled_practice" || block.type === "quiz") {
    const isQuiz = block.type === "quiz";
    return (
      <div className="flex flex-col gap-4">
        <p className={`text-xs font-semibold tracking-[0.06em] uppercase ${isQuiz ? "text-warning" : "text-info"}`}>
          {isQuiz ? t("quiz") : t("controlledPractice")}
        </p>
        {isQuiz && <p className="text-base font-medium">{block.title}</p>}
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

  if (block.type === "speaking_practice") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.06em] text-accent-foreground uppercase">{t("speakingPractice")}</p>
        <p className="text-sm text-muted-foreground">{block.instructions}</p>
        <p className="text-base font-medium">{block.prompt}</p>
        <TaskSubmissionView submission={interaction?.taskSubmission} onSubmit={onSubmitTask} />
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

function MaterialEmbed({ material }: { material: ClientMaterial }) {
  const t = useTranslations("Lesson.blocks");

  if (material.mediaType === "video" && material.embedUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
          <iframe
            src={material.embedUrl}
            title={material.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <MaterialAttribution material={material} />
      </div>
    );
  }

  if (material.mediaType === "audio") {
    return (
      <div className="flex flex-col gap-1.5">
        <audio controls src={material.url} className="w-full">
          {t("audioUnsupported")}
        </audio>
        <MaterialAttribution material={material} />
      </div>
    );
  }

  // image, or a video material without an embed URL yet (thumbnail-only placeholder)
  return (
    <div className="flex flex-col gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- external, licensed source URLs; next/image's domain allowlist isn't worth configuring for a small, curated set of one-off educational sources */}
      <img src={material.thumbnailUrl ?? material.url} alt={material.title} className="w-full rounded-md object-cover" />
      <MaterialAttribution material={material} />
    </div>
  );
}

function MaterialAttribution({ material }: { material: ClientMaterial }) {
  if (!material.attribution && !material.source) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {material.source}
      {material.attribution ? ` — ${material.attribution}` : ""}
      {material.license ? ` (${material.license})` : ""}
    </p>
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
