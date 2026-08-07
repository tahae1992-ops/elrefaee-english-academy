import { NextResponse } from "next/server";
import { createVerifyCertificateUseCase, createDrizzleRateLimiterAdapter } from "@/composition-root";
import { handleVerifyCertificate } from "@/modules/assessment/interface/verify-certificate.controller";

// API Spec §7.4: "aggressively rate-limited by IP specifically because
// it has no auth gate to lean on -- otherwise this is an
// unauthenticated enumeration target." 20 requests per IP per 10
// minutes is deliberately tight for a public lookup endpoint (a
// legitimate verifier checks one or a handful of codes, not dozens).
const VERIFY_RATE_LIMIT = 20;
const VERIFY_RATE_LIMIT_WINDOW_MINUTES = 10;

function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

/** API Spec §7.4: GET /certificates/verify/{code} -- public, unauthenticated. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ip = extractClientIp(request);

  const allowed = await createDrizzleRateLimiterAdapter().checkAndIncrement(`certificate-verify:${ip}`, VERIFY_RATE_LIMIT, VERIFY_RATE_LIMIT_WINDOW_MINUTES);
  if (!allowed) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "Too many verification attempts. Try again shortly." }, { status: 429 });
  }

  const { status, body } = await handleVerifyCertificate(createVerifyCertificateUseCase(), code);
  return NextResponse.json(body, { status });
}
