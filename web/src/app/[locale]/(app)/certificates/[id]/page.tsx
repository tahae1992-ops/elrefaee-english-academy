import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { createGetCertificateUseCase } from "@/composition-root";
import { CertificateNotFoundOrNotOwnedError } from "@/modules/assessment/interface/types";
import { redirect } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { CertificateCard } from "@/components/certificates/certificate-card";

export default async function CertificateDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    redirect({ href: "/login", locale });
    return;
  }

  let certificate;
  try {
    certificate = await createGetCertificateUseCase().execute(id, current.userId);
  } catch (error) {
    if (error instanceof CertificateNotFoundOrNotOwnedError) notFound();
    throw error;
  }

  return <CertificateCard certificate={certificate} holderDisplayName={current.dashboardData.displayName} />;
}
