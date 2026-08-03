import { describe, expect, it } from "vitest";
import { resolvePermissions } from "./resolve-permissions";

describe("resolvePermissions", () => {
  it("unions permissions across every role a user holds, deduplicated", () => {
    const map = new Map([
      ["instructor", ["cohort.view_roster_analytics", "homework.assign_track"]],
      ["curriculum_designer", ["content.create_edit_draft", "cohort.view_roster_analytics"]],
    ]);

    const result = resolvePermissions(["instructor", "curriculum_designer"], map);

    expect(result).toEqual(
      new Set([
        "cohort.view_roster_analytics",
        "homework.assign_track",
        "content.create_edit_draft",
      ]),
    );
  });

  it("returns an empty set for a user with no role assignments", () => {
    const map = new Map([["student", ["progress.view_own"]]]);
    expect(resolvePermissions([], map)).toEqual(new Set());
  });

  it("ignores a role key with no entry in the map rather than throwing", () => {
    const map = new Map([["student", ["progress.view_own"]]]);
    expect(resolvePermissions(["unknown_role"], map)).toEqual(new Set());
  });

  it("returns an empty set for a reserved role with zero permissions", () => {
    const map = new Map([["guardian", []]]);
    expect(resolvePermissions(["guardian"], map)).toEqual(new Set());
  });
});
