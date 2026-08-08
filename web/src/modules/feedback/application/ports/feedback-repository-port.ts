export type FeedbackCategory = "bug" | "suggestion" | "other";

export interface SaveFeedbackInput {
  userId: string;
  category: FeedbackCategory;
  message: string;
  pageUrl?: string;
}

export interface FeedbackRepositoryPort {
  save(input: SaveFeedbackInput): Promise<void>;
}
