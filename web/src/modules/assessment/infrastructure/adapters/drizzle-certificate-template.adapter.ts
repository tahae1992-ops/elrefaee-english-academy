import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { certificateTemplates } from "@/shared/infrastructure/db/tables/i18n";
import type { CertificateTemplatePort } from "@/modules/assessment/application/ports/certificate-template-port";

export class DrizzleCertificateTemplateAdapter implements CertificateTemplatePort {
  async getDisclaimerText(locale: string): Promise<string | null> {
    const [row] = await getDb()
      .select({ body: certificateTemplates.body })
      .from(certificateTemplates)
      .where(and(eq(certificateTemplates.templateKey, "disclaimer"), eq(certificateTemplates.locale, locale)))
      .limit(1);

    return row?.body ?? null;
  }
}
