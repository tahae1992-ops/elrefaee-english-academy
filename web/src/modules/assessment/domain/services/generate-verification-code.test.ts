import { describe, expect, it } from "vitest";
import { generateVerificationCode } from "./generate-verification-code";

describe("generateVerificationCode", () => {
  it("produces a 12-character code", () => {
    expect(generateVerificationCode()).toHaveLength(12);
  });

  it("never includes visually ambiguous characters (0/O, 1/I/L)", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateVerificationCode();
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  it("is deterministic given a fixed byte source, and varies with the source", () => {
    const zeros = () => new Uint8Array(12).fill(0);
    const ones = () => new Uint8Array(12).fill(1);

    expect(generateVerificationCode(zeros)).toBe(generateVerificationCode(zeros));
    expect(generateVerificationCode(zeros)).not.toBe(generateVerificationCode(ones));
  });

  it("draws only from the declared alphabet", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/);
  });
});
