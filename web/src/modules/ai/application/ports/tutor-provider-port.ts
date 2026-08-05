import type { TutorInvokeInput, TutorInvokeOutput } from "@/modules/ai/domain/services/gateway-types";

/** SAD §7.2: "a provider adapter implements [the module's] contract for a specific vendor." Throws AiProviderError on any failure — never returns a partial/empty success. */
export interface TutorProviderPort {
  readonly providerKey: string;
  invoke(input: TutorInvokeInput): Promise<TutorInvokeOutput>;
}
