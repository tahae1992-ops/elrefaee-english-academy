import { headers } from "next/headers";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { createVerifyCertificateUseCase, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { CertificateNotFoundError } from "@/modules/assessment/interface/types";
import type { VerifyCertificateResult } from "@/modules/assessment/interface/types";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

// Same bucket-key scheme as /api/v1/certificates/verify/[code] -- a
// visitor hitting this page (the actual public entry point a shared
// link points to) must count against the same limit as the raw API,
// or the API's rate limit would be trivially bypassed by using the
// page instead.
const VERIFY_RATE_LIMIT = 20;
const VERIFY_RATE_LIMIT_WINDOW_MINUTES = 10;

/**
 * SRS FR-11's AC: "Given any published certificate, when its
 * verification URL is visited, then the disclaimer and the certified
 * level are shown without requiring the verifier to have an
 * account." Public, no app chrome, no auth check.
 */
export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  const allowed = await createDrizzleRateLimiterAdapter().checkAndIncrement(`certificate-verify:${ip}`, VERIFY_RATE_LIMIT, VERIFY_RATE_LIMIT_WINDOW_MINUTES);

  let content: React.ReactNode;
  if (!allowed) {
    content = <RateLimited />;
  } else {
    let result: VerifyCertificateResult | null = null;
    try {
      result = await createVerifyCertificateUseCase().execute(code);
    } catch (error) {
      if (!(error instanceof CertificateNotFoundError)) throw error;
    }
    content = result ? <VerificationResult result={result} /> : <NotFoundCard />;
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-center border-b border-border px-4">
        <Logo variant="mark" className="h-6 w-6" />
      </header>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">{content}</div>
    </main>
  );
}

function VerificationResult({ result }: { result: VerifyCertificateResult }) {
  const t = useTranslations("Verify");

  if (!result.valid) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <XCircle className="size-10 text-destructive" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold">{t("revokedTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("revokedDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold">{t("validTitle")}</h1>
        <p className="font-display text-3xl font-bold">{LEVEL_LABEL[result.cefrLevel] ?? result.cefrLevel.toUpperCase()}</p>
        <p className="text-sm text-muted-foreground">{t("holder", { name: result.holderDisplayName })}</p>
        <p className="text-sm text-muted-foreground">
          {t("issuedBy", { issuer: result.issuer, date: new Date(result.issuedAt).toLocaleDateString() })}
        </p>
        <p className="text-xs text-muted-foreground">{result.disclaimerText}</p>
      </CardContent>
    </Card>
  );
}

function NotFoundCard() {
  const t = useTranslations("Verify");
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold">{t("notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
      </CardContent>
    </Card>
  );
}

function RateLimited() {
  const t = useTranslations("Verify");
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold">{t("rateLimitedTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("rateLimitedDescription")}</p>
      </CardContent>
    </Card>
  );
}
