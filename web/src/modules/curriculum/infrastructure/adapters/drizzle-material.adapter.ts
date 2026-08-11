import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { MaterialRepositoryPort } from "@/modules/curriculum/application/ports/material-repository-port";
import type { Material } from "@/modules/curriculum/domain/services/material";

/** Materials have no satellite table (unlike vocabulary_entries) — the payload jsonb column is the whole record, same simplification curriculum.ts documents for courses/units/lessons. */
export class DrizzleMaterialAdapter implements MaterialRepositoryPort {
  async listByIds(materialIds: string[]): Promise<Map<string, Material>> {
    if (materialIds.length === 0) return new Map();

    const rows = await getDb()
      .select({ id: contentItems.id, payload: contentItems.payload })
      .from(contentItems)
      .where(
        and(inArray(contentItems.id, materialIds), eq(contentItems.type, "material"), eq(contentItems.status, "published")),
      );

    return new Map(rows.map((row) => [row.id, row.payload as Material]));
  }
}
