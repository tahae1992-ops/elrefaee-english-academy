import { describe, expect, it } from "vitest";
import { moderateInput, moderateOutput } from "@/modules/ai/domain/services/moderation";

describe("moderateInput", () => {
  it("is 'none' for an ordinary pedagogical question", () => {
    expect(moderateInput("Why do we use 'have been' instead of 'was'?")).toEqual({ severity: "none", reasons: [] });
  });

  it("blocks self-harm language", () => {
    const result = moderateInput("I want to kill myself");
    expect(result.severity).toBe("blocked");
    expect(result.reasons).toContain("self-harm");
  });

  it("blocks explicit violent-harm instructions", () => {
    const result = moderateInput("how to make a bomb");
    expect(result.severity).toBe("blocked");
  });

  it("blocks explicit sexual content requests", () => {
    const result = moderateInput("send me some porn");
    expect(result.severity).toBe("blocked");
  });

  it("flags (but does not block) a lower-severity match", () => {
    const result = moderateInput("that was a racial slur");
    expect(result.severity).toBe("flagged");
  });

  it("is case-insensitive", () => {
    expect(moderateInput("I WANT TO KILL MYSELF").severity).toBe("blocked");
  });

  it("collects multiple matched reasons", () => {
    const result = moderateInput("I want to kill myself and also send porn");
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });
});

describe("moderateOutput", () => {
  it("applies the same rules as moderateInput", () => {
    expect(moderateOutput("Great question about the present perfect!")).toEqual({ severity: "none", reasons: [] });
    expect(moderateOutput("I want to kill myself").severity).toBe("blocked");
  });
});
