import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createListCertificatesUseCase } from "@/composition-root";
import { redirect } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

/** SRS FR-11 AC / doc 08 §3.10: reachable from the sidebar; empty state shows the path to the first certificate, not a blank page. */
export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  const certificates = await createListCertificatesUseCase().execute(current.userId);

  return <CertificatesList certificates={certificates} />;
}

function CertificatesList({
  certificates,
}: {
  certificates: { id: string; cefrLevel: string; issuedAt: Date; status: "active" | "revoked" }[];
}) {
  const t = useTranslations("Certificate");

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 py-16 text-center md:p-8">
        <Award className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">{t("empty.title")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.01em]">{t("pageTitle")}</h1>
      <div className="flex flex-col gap-2">
        {certificates.map((certificate) => (
          <Link key={certificate.id} href={`/certificates/${certificate.id}`}>
            <Card className="gap-2 transition-opacity hover:opacity-90">
              <CardContent className="flex items-center gap-3 py-4">
                <Award className="size-5 shrink-0 text-accent" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{LEVEL_LABEL[certificate.cefrLevel] ?? certificate.cefrLevel.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
