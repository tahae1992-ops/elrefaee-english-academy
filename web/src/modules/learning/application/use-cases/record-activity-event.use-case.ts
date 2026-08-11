import type {
  ActivityEvent,
  ActivityEventRepositoryPort,
  RecordActivityEventInput,
} from "@/modules/learning/application/ports/activity-event-repository-port";

/**
 * Goal 2's real, persistent (never localStorage) student activity
 * trail. Deliberately a thin pass-through, same shape as
 * RecordExerciseAttemptUseCase — the actual judgment call (which of
 * the 11 event types to fire, and when) lives at each real call site
 * in the interface layer, not here, so this use-case can't drift into
 * a place where events get fired just because it's easy to call.
 */
export class RecordActivityEventUseCase {
  constructor(private readonly activityEvents: ActivityEventRepositoryPort) {}

  async execute(input: RecordActivityEventInput): Promise<ActivityEvent> {
    return this.activityEvents.record(input);
  }
}
