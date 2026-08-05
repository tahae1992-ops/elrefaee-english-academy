import { desc, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { promptTemplates } from "@/modules/ai/infrastructure/db/tables/ai";
import type { PromptTemplateRecord, PromptTemplateRepositoryPort } from "@/modules/ai/application/ports/prompt-template-repository-port";

export class DrizzlePromptTemplateAdapter implements PromptTemplateRepositoryPort {
  async getActive(module: string): Promise<PromptTemplateRecord | null> {
    const [row] = await getDb()
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.module, module))
      .orderBy(desc(promptTemplates.version))
      .limit(1);

    return row ? { id: row.id, module: row.module, version: row.version, templateBody: row.templateBody } : null;
  }
}
