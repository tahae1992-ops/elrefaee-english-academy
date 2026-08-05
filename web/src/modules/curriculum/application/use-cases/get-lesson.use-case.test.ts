import { describe, expect, it, vi } from "vitest";
import { GetLessonUseCase, LessonNotFoundError } from "./get-lesson.use-case";
import type { LessonRepositoryPort, PublishedLesson } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import type { VocabularyEntryRepositoryPort } from "@/modules/curriculum/application/ports/vocabulary-entry-repository-port";
import type { Exercise } from "@/modules/curriculum/domain/services/exercise";
import type { VocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";

function fakeLesson(): PublishedLesson {
  return {
    id: "lesson-1",
    unitId: "unit-1",
    courseId: "course-1",
    orderIndex: 1,
    title: "Meeting People",
    content: {
      title: "Meeting People",
      objective: "I can greet someone.",
      teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
      blocks: [
        { type: "controlled_practice", instructions: "i", exerciseIds: ["ex-1"] },
        { type: "wrap_up", summary: "s", targetVocabularyIds: ["voc-1"] },
      ],
    },
  };
}

function fakeVocabularyRepo(entries: Map<string, VocabularyEntry> = new Map()): VocabularyEntryRepositoryPort {
  return { getById: vi.fn(), listByIds: vi.fn().mockResolvedValue(entries) };
}

describe("GetLessonUseCase", () => {
  it("resolves exerciseIds into client-safe exercises with the answer key stripped, and vocabularyIds into vocabulary entries", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };
    const exercise: Exercise = { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b"], correctOptionIndex: 1, explanation: "e" };
    const exercises: ExerciseRepositoryPort = {
      getById: vi.fn(),
      listByIds: vi.fn().mockResolvedValue(new Map([["ex-1", exercise]])),
    };
    const vocabularyEntry: VocabularyEntry = {
      headword: "hello",
      senseNumber: 1,
      ipaTranscription: "/həˈloʊ/",
      partOfSpeech: "interjection",
      cefrLevel: "a1",
      tier: "active",
      collocations: [],
      synonyms: [],
      exampleSentences: [{ text: "Hello!" }],
    };
    const vocabularyEntries = fakeVocabularyRepo(new Map([["voc-1", vocabularyEntry]]));

    const result = await new GetLessonUseCase(lessons, exercises, vocabularyEntries).execute("lesson-1");

    expect(result.id).toBe("lesson-1");
    const practiceBlock = result.content.blocks[0];
    expect(practiceBlock.type).toBe("controlled_practice");
    if (practiceBlock.type === "controlled_practice") {
      expect(practiceBlock.exercises).toEqual([{ id: "ex-1", exercise: { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b"] } }]);
    }

    const wrapUpBlock = result.content.blocks[1];
    expect(wrapUpBlock.type).toBe("wrap_up");
    if (wrapUpBlock.type === "wrap_up") {
      expect(wrapUpBlock.targetVocabulary).toEqual([{ id: "voc-1", entry: vocabularyEntry }]);
    }
  });

  it("throws LessonNotFoundError when the lesson doesn't exist", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(null) };
    const exercises: ExerciseRepositoryPort = { getById: vi.fn(), listByIds: vi.fn() };
    const vocabularyEntries = fakeVocabularyRepo();

    await expect(new GetLessonUseCase(lessons, exercises, vocabularyEntries).execute("missing")).rejects.toThrow(LessonNotFoundError);
  });
});
