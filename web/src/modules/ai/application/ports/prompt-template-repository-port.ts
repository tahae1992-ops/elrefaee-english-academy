export interface PromptTemplateRecord {
  id: string;
  module: string;
  version: number;
  templateBody: string;
}

export interface PromptTemplateRepositoryPort {
  /** The highest-version row for this module — SAD §7.3's versioned-prompt store. */
  getActive(module: string): Promise<PromptTemplateRecord | null>;
}
