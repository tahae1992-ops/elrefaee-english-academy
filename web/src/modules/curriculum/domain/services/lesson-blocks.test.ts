import { describe, expect, it } from "vitest";
import { blockRequiresInteraction, collectExerciseIds, toClientLessonContent } from "./lesson-blocks";
import type { LessonContent } from "./lesson-blocks";
import type { ClientExercise } from "./exercise";

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
      { type: "wrap_up", summary: "s", targetVocabulary: ["v"] },
    ],
  };
}

describe("collectExerciseIds", () => {
  it("gathers every exerciseId across all controlled_practice blocks", () => {
    expect(collectExerciseIds(fakeLesson())).toEqual(["ex-1", "ex-2"]);
  });
});

describe("toClientLessonContent", () => {
  it("resolves exerciseIds into the given client-safe exercises, and strips teacherNote", () => {
    const resolved = new Map<string, ClientExercise>([
      ["ex-1", { exerciseType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] }],
      ["ex-2", { exerciseType: "true_false", prompt: "The sky is blue." }],
    ]);

    const client = toClientLessonContent(fakeLesson(), resolved);

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
  });

  it("throws if a referenced exerciseId wasn't resolved", () => {
    expect(() => toClientLessonContent(fakeLesson(), new Map())).toThrow(/ex-1/);
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
