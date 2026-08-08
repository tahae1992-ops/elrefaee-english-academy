// Re-exported so UI code can reference these types without reaching
// past this Interface-layer module into Application/Domain internals
// (arch-check's no-cross-module-reach-into-internals rule, SAD §4).
export type { FeedbackCategory } from "@/modules/feedback/application/ports/feedback-repository-port";
