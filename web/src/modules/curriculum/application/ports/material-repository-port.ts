import type { Material } from "@/modules/curriculum/domain/services/material";

export interface MaterialRepositoryPort {
  /** Batch fetch for resolving a lesson's video/listening `materialId` references in one query. */
  listByIds(materialIds: string[]): Promise<Map<string, Material>>;
}
