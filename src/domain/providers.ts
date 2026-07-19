export const PROVIDER_IDS = ["cpsc", "fda_food", "nhtsa"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const RETRIEVAL_COMPLETENESS = [
  "complete",
  "partial",
  "unavailable",
] as const;
export type RetrievalCompleteness = (typeof RETRIEVAL_COMPLETENESS)[number];
export const MODEL_STATES = ["model_ready", "model_unavailable"] as const;
export type ModelState = (typeof MODEL_STATES)[number];
export const ASSISTANCE_MODES = ["assisted", "manual_mode"] as const;
export type AssistanceMode = (typeof ASSISTANCE_MODES)[number];
export const DATA_MODES = ["current_query", "recorded_response"] as const;
export type DataMode = (typeof DATA_MODES)[number];

export interface RetrievalStatus {
  readonly completeness: RetrievalCompleteness;
  readonly requiredQueries: number;
  readonly completedQueries: number;
  readonly fullyCompletedProviderIds: readonly ProviderId[];
  readonly capped: boolean;
  readonly truncated: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === "string" && PROVIDER_IDS.includes(value as ProviderId)
  );
}

export function assertValidRetrievalStatus(
  value: unknown,
): asserts value is RetrievalStatus {
  if (!isRecord(value)) {
    throw new Error("Retrieval status must be an object");
  }

  const retrieval = value;
  const requiredQueries = retrieval.requiredQueries;
  const completedQueries = retrieval.completedQueries;
  if (
    typeof retrieval.completeness !== "string" ||
    !RETRIEVAL_COMPLETENESS.includes(
      retrieval.completeness as RetrievalCompleteness,
    ) ||
    !Array.isArray(retrieval.fullyCompletedProviderIds) ||
    !retrieval.fullyCompletedProviderIds.every(isProviderId) ||
    typeof retrieval.capped !== "boolean" ||
    typeof retrieval.truncated !== "boolean"
  ) {
    throw new Error(
      "Retrieval status has invalid enum, provider IDs, or flags",
    );
  }

  if (
    typeof requiredQueries !== "number" ||
    typeof completedQueries !== "number" ||
    !Number.isInteger(requiredQueries) ||
    !Number.isInteger(completedQueries) ||
    requiredQueries < 0 ||
    completedQueries < 0 ||
    completedQueries > requiredQueries
  ) {
    throw new Error("Retrieval query counts are inconsistent");
  }
  if (
    new Set(retrieval.fullyCompletedProviderIds).size !==
    retrieval.fullyCompletedProviderIds.length
  ) {
    throw new Error("Completed provider IDs must be unique");
  }
  if (
    retrieval.completeness === "complete" &&
    (retrieval.requiredQueries === 0 ||
      retrieval.completedQueries !== retrieval.requiredQueries ||
      retrieval.fullyCompletedProviderIds.length === 0 ||
      retrieval.capped ||
      retrieval.truncated)
  ) {
    throw new Error(
      "A complete retrieval requires completed uncapped and untruncated queries",
    );
  }
}
