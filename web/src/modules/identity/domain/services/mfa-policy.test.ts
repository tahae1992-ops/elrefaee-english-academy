import { describe, expect, it } from "vitest";
import { requiresMfa } from "./mfa-policy";

describe("requiresMfa", () => {
  it("is false for a Student-only role set", () => {
    expect(requiresMfa(["student"])).toBe(false);
  });

  it("is true when any held role is an elevated role", () => {
    expect(requiresMfa(["student", "instructor"])).toBe(true);
    expect(requiresMfa(["academy_admin"])).toBe(true);
    expect(requiresMfa(["super_admin"])).toBe(true);
  });

  it("is false for an empty role set", () => {
    expect(requiresMfa([])).toBe(false);
  });
});
