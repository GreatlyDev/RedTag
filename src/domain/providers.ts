export const PROVIDER_IDS = ["cpsc", "fda_food", "nhtsa"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type RetrievalCompleteness = "complete" | "partial" | "unavailable";
export type ModelState = "model_ready" | "model_unavailable";
export type AssistanceMode = "assisted" | "manual_mode";
export type DataMode = "current_query" | "recorded_response";

export interface RetrievalStatus {
  readonly completeness: RetrievalCompleteness;
  readonly requiredQueries: number;
  readonly completedQueries: number;
  readonly fullyCompletedProviderIds: readonly ProviderId[];
  readonly capped: boolean;
  readonly truncated: boolean;
}
