// Re-exported so UI/Route Handler/shared-lib code stays within the arch-check boundary rule (only a module's interface layer is importable from outside it).
export type { TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";
export type { TutorPromptContext } from "@/modules/ai/domain/services/tutor-prompt";
export { deriveTutorStarters } from "@/modules/ai/domain/services/tutor-prompt";
export { PromptTemplateNotFoundError, TutorRateLimitExceededError } from "@/modules/ai/application/use-cases/send-tutor-message.use-case";
export type { SendTutorMessageResult } from "@/modules/ai/application/use-cases/send-tutor-message.use-case";
export { TutorMessageNotFoundError } from "@/modules/ai/application/use-cases/flag-tutor-message.use-case";
export { AiUnavailableError } from "@/modules/ai/domain/services/gateway-types";
