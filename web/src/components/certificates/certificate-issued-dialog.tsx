"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/** Wireframe §3.10 / Hi-Fi §5.11: the one-time, full-screen-feeling celebratory moment on issuance -- `[View certificate]` dismisses to the persistent detail view. Motion respects prefers-reduced-motion via dialog.tsx's own motion-reduce variant. */
export function CertificateIssuedDialog({
  open,
  onOpenChange,
  certificateId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: string;
}) {
  const t = useTranslations("Exam.results.issuedDialog");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="items-center text-center">
        <Sparkles className="size-10 text-accent" aria-hidden="true" />
        <DialogTitle className="font-display text-2xl">{t("title")}</DialogTitle>
        <DialogDescription>{t("description")}</DialogDescription>
        <Button asChild className="w-full">
          <Link href={`/certificates/${certificateId}`}>{t("viewCertificate")}</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
