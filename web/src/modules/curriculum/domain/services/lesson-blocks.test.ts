import { describe, expect, it } from "vitest";
import { blockRequiresInteraction, toClientLessonContent } from "./lesson-blocks";
import type { LessonContent } from "./lesson-blocks";

function fakeLesson(): LessonContent {
  return {
    title: "Test Lesson",
    objective: "I can test.",
    teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
    blocks: [
      { type: "warm_up", prompt: "p", content: "c" },
      { type: "presentation", explanation: "e", examples: ["ex"] },
      {
        type: "controlled_practice",
        instructions: "i",
        exercises: [{ itemType: "multiple_choice", prompt: "1+1?", options: ["1", "2"], correctOptionIndex: 1 }],
      },
      { type: "communicative_task", instructions: "i", prompt: "p" },
      { type: "wrap_up", summary: "s", targetVocabulary: ["v"] },
    ],
  };
}

describe("toClientLessonContent", () => {
  it("strips correctOptionIndex and teacherNote, keeps everything else", () => {
    const client = toClientLessonContent(fakeLesson());

    expect(client.title).toBe("Test Lesson");
    expect(client).not.toHaveProperty("teacherNote");
    const practiceBlock = client.blocks[2];
    expect(practiceBlock.type).toBe("controlled_practice");
    if (practiceBlock.type === "controlled_practice") {
      expect(practiceBlock.exercises[0]).not.toHaveProperty("correctOptionIndex");
      expect(practiceBlock.exercises[0]).toEqual({ itemType: "multiple_choice", prompt: "1+1?", options: ["1", "2"] });
    }
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
