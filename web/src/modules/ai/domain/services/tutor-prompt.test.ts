import { describe, expect, it } from "vitest";
import { buildTutorSystemPrompt, deriveTutorStarters } from "@/modules/ai/domain/services/tutor-prompt";

const TEMPLATE = "Level: {{cefrLevel}}. Lesson: {{lessonTitle}} ({{lessonObjective}}). Vocab: {{targetVocabulary}}. Mistakes: {{recentMistakes}}.";

describe("buildTutorSystemPrompt", () => {
  it("interpolates every placeholder with the given context", () => {
    const result = buildTutorSystemPrompt(TEMPLATE, {
      cefrLevel: "a1",
      lessonTitle: "Meeting People",
      lessonObjective: "I can greet someone.",
      targetVocabulary: ["hello", "hi"],
      recentMistakes: ["confused 'is' vs 'are'"],
    });

    expect(result).toBe(
      "Level: a1. Lesson: Meeting People (I can greet someone.). Vocab: hello, hi. Mistakes: confused 'is' vs 'are'.",
    );
  });

  it("falls back to a neutral placeholder when there are no target vocabulary items", () => {
    const result = buildTutorSystemPrompt("{{targetVocabulary}}", {
      cefrLevel: "a1",
      lessonTitle: "t",
      lessonObjective: "o",
      targetVocabulary: [],
      recentMistakes: [],
    });
    expect(result).toBe("(none listed)");
  });

  it("falls back to a neutral placeholder when there are no recent mistakes", () => {
    const result = buildTutorSystemPrompt("{{recentMistakes}}", {
      cefrLevel: "a1",
      lessonTitle: "t",
      lessonObjective: "o",
      targetVocabulary: [],
      recentMistakes: [],
    });
    expect(result).toBe("(none yet)");
  });

  it("leaves an unrecognized placeholder untouched rather than throwing", () => {
    const result = buildTutorSystemPrompt("{{unknownField}}", {
      cefrLevel: "a1",
      lessonTitle: "t",
      lessonObjective: "o",
      targetVocabulary: [],
      recentMistakes: [],
    });
    expect(result).toBe("{{unknownField}}");
  });
});

describe("deriveTutorStarters", () => {
  const base = { cefrLevel: "a1", lessonTitle: "Meeting People", lessonObjective: "o", targetVocabulary: [] };

  it("turns a vocabulary mistake into a suggested question", () => {
    const starters = deriveTutorStarters({ ...base, recentMistakes: ['Vocabulary: "hello" (still learning)'] });
    expect(starters).toEqual(['Can you explain the word "hello"?']);
  });

  it("turns an exercise mistake into a suggested question", () => {
    const starters = deriveTutorStarters({ ...base, recentMistakes: ['Exercise: "She ___ happy."'] });
    expect(starters).toEqual(['I got this one wrong — can you help me understand it: "She ___ happy."?']);
  });

  it("caps suggestions at 3 even with more mistakes", () => {
    const recentMistakes = ["a", "b", "c", "d"].map((w) => `Vocabulary: "${w}" (still learning)`);
    const starters = deriveTutorStarters({ ...base, recentMistakes });
    expect(starters).toHaveLength(3);
  });

  it("falls back to a lesson-based starter when there are no mistakes", () => {
    const starters = deriveTutorStarters({ ...base, recentMistakes: [] });
    expect(starters).toEqual(['Can you help me understand "Meeting People"?']);
  });
});
