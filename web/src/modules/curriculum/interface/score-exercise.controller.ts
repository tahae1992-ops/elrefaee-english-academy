import { z } from "zod";
import type { ScoreExerciseUseCase } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";
import { ExerciseNotFoundError } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";
import { ExerciseResponseTypeMismatchError } from "@/modules/curriculum/domain/services/score-exercise";
import type { ScoreResult } from "@/modules/curriculum/domain/services/score-exercise";

export const exerciseResponseSchema = z.discriminatedUnion("exerciseType", [
  z.object({ exerciseType: z.literal("multiple_choice"), selectedOptionIndex: z.number().int().min(0) }),
  z.object({ exerciseType: z.literal("fill_in_blank"), submittedText: z.string() }),
  z.object({ exerciseType: z.literal("matching"), matchedPairs: z.array(z.tuple([z.string(), z.string()])) }),
  z.object({ exerciseType: z.literal("ordering"), submittedOrder: z.array(z.string()) }),
  z.object({ exerciseType: z.literal("true_false"), submittedAnswer: z.boolean() }),
  z.object({ exerciseType: z.literal("short_answer"), submittedText: z.string() }),
  z.object({ exerciseType: z.literal("sentence_building"), submittedOrder: z.array(z.string()) }),
]);

export type ParsedExerciseResponse = z.infer<typeof exerciseResponseSchema>;

export interface ScoreExerciseControllerResult {
  status: number;
  body: unknown;
  score?: ScoreResult;
  parsedResponse?: ParsedExerciseResponse;
}

// Not in API Spec §6.4's table itself (POST /exercises/{id}/attempts is
// documented but its request/response shape isn't ★-detailed anywhere)
// — this validates + scores; the Route Handler additionally records
// the attempt via the `learning` module (cross-module orchestration,
// same pattern as the Placement Test finalize route).
export async function handleScoreExercise(
  useCase: ScoreExerciseUseCase,
  exerciseId: string,
  body: unknown,
): Promise<ScoreExerciseControllerResult> {
  const parsed = exerciseResponseSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const score = await useCase.execute(exerciseId, parsed.data);
    return { status: 200, body: score, score, parsedResponse: parsed.data };
  } catch (error) {
    if (error instanceof ExerciseNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof ExerciseResponseTypeMismatchError) {
      return { status: 400, body: { error: "VALIDATION_FAILED", message: error.message } };
    }

    console.error("POST /api/v1/exercises/[id]/attempts failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not score exercise." } };
  }
}
