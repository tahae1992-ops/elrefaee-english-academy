"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Award, Check, Copy, Download, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { composeCertificateImage } from "@/components/certificates/compose-certificate-image";
import type { CertificateRecord } from "@/modules/assessment/interface/types";

const LEVEL_LABEL: Record<string, string> = { pre_a1: "Pre-A1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

/** Hi-Fi §5.11: centered portrait card, max-width 480px, generous padding, accent-500 as the one screen where it legitimately dominates (decorative border), CEFR level the single largest/most prominent text, disclaimer always visible (never a tooltip). */
export function CertificateCard({ certificate, holderDisplayName }: { certificate: CertificateRecord; holderDisplayName: string }) {
  const t = useTranslations("Certificate");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const verificationUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${certificate.verificationCode}` : `/verify/${certificate.verificationCode}`;
  const issuedAtLabel = new Date(certificate.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long" });

  function renderImage(): HTMLCanvasElement | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    composeCertificateImage(canvas, {
      levelLabel: LEVEL_LABEL[certificate.cefrLevel] ?? certificate.cefrLevel.toUpperCase(),
      issuer: certificate.issuer,
      issuedAtLabel,
      holderDisplayName,
      disclaimerText: certificate.disclaimerText,
      verificationUrl,
    });
    return canvas;
  }

  async function handleShare() {
    const canvas = renderImage();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "certificate.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: t("shareTitle") });
          return;
        } catch {
          // User cancelled or share failed -- fall through to download.
        }
      }
      downloadBlob(blob);
    });
  }

  function handleDownload() {
    const canvas = renderImage();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob);
    });
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `era-certificate-${certificate.cefrLevel}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 md:p-8">
      <Card className="w-full max-w-[480px] gap-6 border-2 border-accent/40 bg-neutral-50 p-8 text-center dark:bg-neutral-950">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <Award className="size-10 text-accent" aria-hidden="true" />

          {certificate.status === "revoked" && <Badge className="bg-warning-bg text-warning-text">{t("revoked")}</Badge>}

          <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{certificate.issuer}</p>
          <p className="font-display text-4xl font-bold text-primary">{LEVEL_LABEL[certificate.cefrLevel] ?? certificate.cefrLevel.toUpperCase()}</p>
          <p className="text-sm text-muted-foreground">{t("issuedOn", { date: issuedAtLabel })}</p>

          <p className="text-xs text-muted-foreground">{certificate.disclaimerText}</p>

          <div className="flex w-full flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleShare}>
                <Share2 className="size-4" aria-hidden="true" />
                {t("share")}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="size-4" aria-hidden="true" />
                {t("download")}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? t("linkCopied") : t("copyLink")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
