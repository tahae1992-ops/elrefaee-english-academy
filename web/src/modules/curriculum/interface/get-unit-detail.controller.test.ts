import { describe, expect, it, vi } from "vitest";
import { handleGetUnitDetail } from "./get-unit-detail.controller";
import { UnitNotFoundError } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
import type { GetUnitDetailUseCase } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";

function fakeUseCase(execute: GetUnitDetailUseCase["execute"]): GetUnitDetailUseCase {
  return { execute } as unknown as GetUnitDetailUseCase;
}

describe("handleGetUnitDetail", () => {
  it("returns 200 with the unit detail on success", async () => {
    const detail = { unit: { id: "u1" }, course: { id: "c1" }, lessons: [] };
    const { status, body } = await handleGetUnitDetail(fakeUseCase(vi.fn().mockResolvedValue(detail)), "u1");

    expect(status).toBe(200);
    expect(body).toBe(detail);
  });

  it("maps UnitNotFoundError to 404", async () => {
    const { status } = await handleGetUnitDetail(fakeUseCase(vi.fn().mockRejectedValue(new UnitNotFoundError())), "missing");

    expect(status).toBe(404);
  });
});
