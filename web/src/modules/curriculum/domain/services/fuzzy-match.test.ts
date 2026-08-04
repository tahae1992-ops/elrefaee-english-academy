import { describe, expect, it } from "vitest";
import { fuzzyMatches, levenshteinDistance, matchesAnyAcceptedAnswer } from "./fuzzy-match";

describe("levenshteinDistance", () => {
  it("is 0 for identical strings", () => {
    expect(levenshteinDistance("hello", "hello")).toBe(0);
  });

  it("counts single-character edits", () => {
    expect(levenshteinDistance("hello", "helo")).toBe(1); // deletion
    expect(levenshteinDistance("cat", "cats")).toBe(1); // insertion
    expect(levenshteinDistance("cat", "bat")).toBe(1); // substitution
  });
});

describe("fuzzyMatches", () => {
  it("matches exact strings regardless of case/whitespace", () => {
    expect(fuzzyMatches("Hello", "hello")).toBe(true);
    expect(fuzzyMatches("  hello  ", "hello")).toBe(true);
  });

  it("SRS FR-07 AC: a single-character typo on a word under 6 characters is marked correct", () => {
    expect(fuzzyMatches("helo", "hello")).toBe(true); // 5-char accepted answer, distance 1
  });

  it("allows tolerance 2 for accepted answers longer than 6 characters", () => {
    expect(fuzzyMatches("exhausted", "exhausted")).toBe(true);
    expect(fuzzyMatches("exhaustd", "exhausted")).toBe(true); // 1 deletion, 9-char accepted answer
    expect(levenshteinDistance("exhaustn", "exhausting")).toBe(2); // 2 deletions
    expect(fuzzyMatches("exhaustn", "exhausting")).toBe(true); // distance 2, within tolerance for a 10-char word
  });

  it("rejects answers beyond the tolerance for their length", () => {
    expect(fuzzyMatches("xyz", "cat")).toBe(false); // 3-char word, tolerance 1, distance 3
    expect(fuzzyMatches("completely different", "hello")).toBe(false);
  });
});

describe("matchesAnyAcceptedAnswer", () => {
  it("matches if any accepted answer fuzzy-matches", () => {
    expect(matchesAnyAcceptedAnswer("go", ["went", "go", "goes"])).toBe(true);
    expect(matchesAnyAcceptedAnswer("goe", ["went", "goes"])).toBe(true); // 1 deletion from "goes"
  });

  it("returns false when no accepted answer matches", () => {
    expect(matchesAnyAcceptedAnswer("nope", ["went", "goes"])).toBe(false);
  });
});
