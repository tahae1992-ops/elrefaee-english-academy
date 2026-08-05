import { NextResponse } from "next/server";
import { z } from "zod";
import { createFlagTutorMessageUseCase } from "@/composition-root";
import { getCurrentUserWithDashboardData } from "@/modules/identity/interface/current-user";
import { handleFlagTutorMessage } from "@/modules/ai/interface/flag-tutor-message.controller";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

/** doc 08 §3.11's "[Flag for instructor]" action on any AI response — not in the API Spec's table verbatim (a non-CRUD domain action on the message resource, same pattern as `/content-items/{id}/publish`). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentUserWithDashboardData();
  if (!current) {
    return NextResponse.json({ error: "UNAUTHENTICATED", message: "Sign in required." }, { status: 401 });
  }

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: "Invalid message id." }, { status: 400 });
  }

  const { status, body } = await handleFlagTutorMessage(createFlagTutorMessageUseCase(), current.userId, parsedParams.data.id);
  return NextResponse.json(body, { status });
}
