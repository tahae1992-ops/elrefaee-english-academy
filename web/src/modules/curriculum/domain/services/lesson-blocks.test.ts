import { describe, expect, it } from "vitest";
import {
  blockRequiresInteraction,
  collectExerciseIds,
  collectVocabularyEntryIds,
  collectMaterialIds,
  toClientLessonContent,
} from "./lesson-blocks";
import type { LessonContent } from "./lesson-blocks";
import type { ClientExercise } from "./exercise";
import type { ClientVocabularyEntry } from "./vocabulary-entry";
import type { ClientMaterial } from "./material";

function fakeLesson(): LessonContent {
  return {
    title: "Test Lesson",
    objective: "I can test.",
    teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
    blocks: [
      { type: "warm_up", prompt: "p", content: "c" },
      { type: "presentation", explanation: "e", examples: ["ex"] },
      { type: "vocabulary", instructions: "i", vocabularyIds: ["voc-2"] },
      { type: "video", title: "t", instructions: "i", materialId: "mat-1" },
      { type: "controlled_practice", instructions: "i", exerciseIds: ["ex-1", "ex-2"] },
      { type: "quiz", title: "q", instructions: "i", exerciseIds: ["ex-3"], passingScorePercent: 70 },
      { type: "communicative_task", instructions: "i", prompt: "p" },
      { type: "wrap_up", summary: "s", targetVocabularyIds: ["voc-1"] },
    ],
  };
}

const fakeVocabularyEntry: ClientVocabularyEntry = {
  headword: "hello",
  senseNumber: 1,
  ipaTranscription: "/həˈloʊ/",
  partOfSpeech: "interjection",
  cefrLevel: "a1",
  tier: "active",
  collocations: [],
  synonyms: ["hi"],
  exampleSentences: [{ text: "Hello, how are you?" }],
};

const fakeMaterial: ClientMaterial = {
  mediaType: "video",
  title: "A video",
  source: "YouTube",
  url: "https://www.youtube.com/watch?v=abc",
  embedUrl: "https://www.youtube.com/embed/abc",
};

function fakeMaps() {
  return {
    resolvedExercises: new Map<string, ClientExercise>([
      ["ex-1", { exerciseType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] }],
      ["ex-2", { exerciseType: "true_false", prompt: "The sky is blue." }],
      ["ex-3", { exerciseType: "true_false", prompt: "The sky is green." }],
    ]),
    resolvedVocabulary: new Map<string, ClientVocabularyEntry>([
      ["voc-1", fakeVocabularyEntry],
      ["voc-2", fakeVocabularyEntry],
    ]),
    resolvedMaterials: new Map<string, ClientMaterial>([["mat-1", fakeMaterial]]),
  };
}

describe("collectExerciseIds", () => {
  it("gathers every exerciseId across controlled_practice and quiz blocks", () => {
    expect(collectExerciseIds(fakeLesson())).toEqual(["ex-1", "ex-2", "ex-3"]);
  });
});

describe("collectVocabularyEntryIds", () => {
  it("gathers every vocabularyEntryId across vocabulary and wrap_up blocks", () => {
    expect(collectVocabularyEntryIds(fakeLesson())).toEqual(["voc-2", "voc-1"]);
  });
});

describe("collectMaterialIds", () => {
  it("gathers every materialId across video/listening blocks", () => {
    expect(collectMaterialIds(fakeLesson())).toEqual(["mat-1"]);
  });
});

describe("toClientLessonContent", () => {
  it("resolves every reference into its client-safe form, and strips teacherNote", () => {
    const { resolvedExercises, resolvedVocabulary, resolvedMaterials } = fakeMaps();
    const client = toClientLessonContent(fakeLesson(), resolvedExercises, resolvedVocabulary, resolvedMaterials);

    expect(client.title).toBe("Test Lesson");
    expect(client).not.toHaveProperty("teacherNote");

    const vocabBlock = client.blocks[2];
    expect(vocabBlock.type).toBe("vocabulary");
    if (vocabBlock.type === "vocabulary") {
      expect(vocabBlock.vocabulary).toEqual([{ id: "voc-2", entry: fakeVocabularyEntry }]);
    }

    const videoBlock = client.blocks[3];
    expect(videoBlock.type).toBe("video");
    if (videoBlock.type === "video") {
      expect(videoBlock.material).toEqual({ id: "mat-1", material: fakeMaterial });
    }

    const quizBlock = client.blocks[5];
    expect(quizBlock.type).toBe("quiz");
    if (quizBlock.type === "quiz") {
      expect(quizBlock.passingScorePercent).toBe(70);
      expect(quizBlock.exercises).toEqual([
        { id: "ex-3", exercise: { exerciseType: "true_false", prompt: "The sky is green." } },
      ]);
    }

    const wrapUpBlock = client.blocks[7];
    expect(wrapUpBlock.type).toBe("wrap_up");
    if (wrapUpBlock.type === "wrap_up") {
      expect(wrapUpBlock.targetVocabulary).toEqual([{ id: "voc-1", entry: fakeVocabularyEntry }]);
    }
  });

  it("throws if a referenced exerciseId wasn't resolved", () => {
    const { resolvedVocabulary, resolvedMaterials } = fakeMaps();
    expect(() => toClientLessonContent(fakeLesson(), new Map(), resolvedVocabulary, resolvedMaterials)).toThrow(/ex-1/);
  });

  it("throws if a referenced vocabularyEntryId wasn't resolved", () => {
    const { resolvedExercises, resolvedMaterials } = fakeMaps();
    expect(() => toClientLessonContent(fakeLesson(), resolvedExercises, new Map(), resolvedMaterials)).toThrow(/voc-2/);
  });

  it("throws if a referenced materialId wasn't resolved", () => {
    const { resolvedExercises, resolvedVocabulary } = fakeMaps();
    expect(() => toClientLessonContent(fakeLesson(), resolvedExercises, resolvedVocabulary, new Map())).toThrow(/mat-1/);
  });
});

describe("blockRequiresInteraction", () => {
  it("requires interaction only for controlled_practice, speaking_practice, communicative_task, and quiz", () => {
    expect(blockRequiresInteraction("warm_up")).toBe(false);
    expect(blockRequiresInteraction("presentation")).toBe(false);
    expect(blockRequiresInteraction("vocabulary")).toBe(false);
    expect(blockRequiresInteraction("video")).toBe(false);
    expect(blockRequiresInteraction("reading")).toBe(false);
    expect(blockRequiresInteraction("listening")).toBe(false);
    expect(blockRequiresInteraction("controlled_practice")).toBe(true);
    expect(blockRequiresInteraction("speaking_practice")).toBe(true);
    expect(blockRequiresInteraction("communicative_task")).toBe(true);
    expect(blockRequiresInteraction("quiz")).toBe(true);
    expect(blockRequiresInteraction("wrap_up")).toBe(false);
  });
});
