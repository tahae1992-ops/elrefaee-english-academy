/** shared.certificate_templates read path -- resolved once at issuance and frozen onto the certificate row (DDD §3.4's freeze-at-issuance principle), never live-linked. */
export interface CertificateTemplatePort {
  getDisclaimerText(locale: string): Promise<string | null>;
}
