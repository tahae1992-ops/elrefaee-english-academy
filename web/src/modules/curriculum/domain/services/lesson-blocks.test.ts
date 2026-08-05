import { describe, expect, it } from "vitest";
import { blockRequiresInteraction, collectExerciseIds, collectVocabularyEntryIds, toClientLessonContent } from "./lesson-blocks";
import type { LessonContent } from "./lesson-blocks";
import type { ClientExercise } from "./exercise";
import type { ClientVocabularyEntry } from "./vocabulary-entry";

function fakeLesson(): LessonContent {
  return {
    title: "Test Lesson",
    objective: "I can test.",
    teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
    blocks: [
      { type: "warm_up", prompt: "p", content: "c" },
      { type: "presentation", explanation: "e", examples: ["ex"] },
      { type: "controlled_practice", instructions: "i", exerciseIds: ["ex-1", "ex-2"] },
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

describe("collectExerciseIds", () => {
  it("gathers every exerciseId across all controlled_practice blocks", () => {
    expect(collectExerciseIds(fakeLesson())).toEqual(["ex-1", "ex-2"]);
  });
});

describe("collectVocabularyEntryIds", () => {
  it("gathers every vocabularyEntryId across all wrap_up blocks", () => {
    expect(collectVocabularyEntryIds(fakeLesson())).toEqual(["voc-1"]);
  });
});

describe("toClientLessonContent", () => {
  it("resolves exerciseIds/vocabularyEntryIds into their client-safe forms, and strips teacherNote", () => {
    const resolvedExercises = new Map<string, ClientExercise>([
      ["ex-1", { exerciseType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] }],
      ["ex-2", { exerciseType: "true_false", prompt: "The sky is blue." }],
    ]);
    const resolvedVocabulary = new Map<string, ClientVocabularyEntry>([["voc-1", fakeVocabularyEntry]]);

    const client = toClientLessonContent(fakeLesson(), resolvedExercises, resolvedVocabulary);

    expect(client.title).toBe("Test Lesson");
    expect(client).not.toHaveProperty("teacherNote");

    const practiceBlock = client.blocks[2];
    expect(practiceBlock.type).toBe("controlled_practice");
    if (practiceBlock.type === "controlled_practice") {
      expect(practiceBlock.exercises).toEqual([
        { id: "ex-1", exercise: { exerciseType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] } },
        { id: "ex-2", exercise: { exerciseType: "true_false", prompt: "The sky is blue." } },
      ]);
    }

    const wrapUpBlock = client.blocks[4];
    expect(wrapUpBlock.type).toBe("wrap_up");
    if (wrapUpBlock.type === "wrap_up") {
      expect(wrapUpBlock.targetVocabulary).toEqual([{ id: "voc-1", entry: fakeVocabularyEntry }]);
    }
  });

  it("throws if a referenced exerciseId wasn't resolved", () => {
    expect(() => toClientLessonContent(fakeLesson(), new Map(), new Map([["voc-1", fakeVocabularyEntry]]))).toThrow(/ex-1/);
  });

  it("throws if a referenced vocabularyEntryId wasn't resolved", () => {
    const resolvedExercises = new Map<string, ClientExercise>([
      ["ex-1", { exerciseType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] }],
      ["ex-2", { exerciseType: "true_false", prompt: "The sky is blue." }],
    ]);
    expect(() => toClientLessonContent(fakeLesson(), resolvedExercises, new Map())).toThrow(/voc-1/);
  });
});

describe("blockRequiresInteraction", () => {
  it("requires interaction only for controlled_practice and communicative_task", () => {
    expect(blockRequiresInteraction("warm_up")).toBe(false);
    expect(blockRequiresInteraction("presentation")).toBe(false);
    expect(blockRequiresInteraction("controlled_practice")).toBe(true);
    expect(blockRequiresInteraction("communicative_task")).toBe(true);
    expect(blockRequiresInteraction("wrap_up")).toBe(false);
  });
});
