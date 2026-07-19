import type {
  AssistanceMode,
  DataMode,
  ModelState,
  RetrievalStatus,
} from "../providers";
import type {
  DecisionCounts,
  RecordDecision,
  ResultDecision,
  ScanState,
  ScanSummary,
} from "../results";

export interface ComposeScanSummaryInput {
  readonly decisions: readonly RecordDecision[];
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
  readonly preEvaluationState?: "insufficient_identifier" | "unsupported";
}

const RESULT_RANK: Readonly<Record<ResultDecision, number>> = {
  confirmed_match: 4,
  possible_match: 3,
  identifier_conflict: 2,
  vehicle_campaigns_found: 1,
};

function countDecisions(decisions: readonly RecordDecision[]): DecisionCounts {
  const counts: Record<ResultDecision, number> = {
    confirmed_match: 0,
    possible_match: 0,
    identifier_conflict: 0,
    vehicle_campaigns_found: 0,
  };

  for (const decision of decisions) counts[decision.result] += 1;
  return counts;
}

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function hasValidCompleteRetrieval(retrieval: RetrievalStatus): boolean {
  return (
    retrieval.completeness === "complete" &&
    retrieval.requiredQueries > 0 &&
    retrieval.completedQueries === retrieval.requiredQueries &&
    retrieval.fullyCompletedProviderIds.length > 0 &&
    !retrieval.capped &&
    !retrieval.truncated
  );
}

function validateInput(input: ComposeScanSummaryInput): void {
  const { retrieval } = input;
  const countsAreValid =
    Number.isInteger(retrieval.requiredQueries) &&
    Number.isInteger(retrieval.completedQueries) &&
    retrieval.requiredQueries >= 0 &&
    retrieval.completedQueries >= 0 &&
    retrieval.completedQueries <= retrieval.requiredQueries;
  if (!countsAreValid)
    throw new Error("Retrieval query counts are inconsistent");

  if (
    retrieval.completeness === "complete" &&
    !hasValidCompleteRetrieval(retrieval)
  ) {
    throw new Error(
      "A complete retrieval requires completed uncapped and untruncated queries",
    );
  }

  if (hasDuplicates(retrieval.fullyCompletedProviderIds)) {
    throw new Error("Completed provider IDs must be unique");
  }

  if (hasDuplicates(input.decisions.map(({ id }) => id))) {
    throw new Error("Record-decision IDs must be unique");
  }

  if (
    input.modelState === "model_unavailable" &&
    input.assistanceMode !== "manual_mode"
  ) {
    throw new Error("An unavailable model requires manual mode");
  }

  if (input.decisions.length > 0 && retrieval.completedQueries === 0) {
    throw new Error("A record decision requires at least one completed query");
  }

  if (
    input.preEvaluationState &&
    (input.decisions.length > 0 ||
      retrieval.completedQueries > 0 ||
      retrieval.fullyCompletedProviderIds.length > 0)
  ) {
    throw new Error(
      "A pre-evaluation state cannot coexist with provider evaluation",
    );
  }

  const axesMatch = input.decisions.every(
    (decision) =>
      decision.modelState === input.modelState &&
      decision.assistanceMode === input.assistanceMode &&
      decision.dataMode === input.dataMode,
  );
  if (!axesMatch) {
    throw new Error(
      "Record-decision operational axes must match the scan summary",
    );
  }
}

function highestDecisionState(
  counts: DecisionCounts,
): ResultDecision | undefined {
  return (Object.keys(RESULT_RANK) as ResultDecision[]).reduce<
    ResultDecision | undefined
  >((highest, state) => {
    if (counts[state] === 0) return highest;
    return !highest || RESULT_RANK[state] > RESULT_RANK[highest]
      ? state
      : highest;
  }, undefined);
}

function deriveState(
  input: ComposeScanSummaryInput,
  counts: DecisionCounts,
): ScanState {
  if (input.preEvaluationState) return input.preEvaluationState;

  const candidateState = highestDecisionState(counts);
  if (candidateState) return candidateState;

  return hasValidCompleteRetrieval(input.retrieval)
    ? "no_match_found"
    : "not_evaluated";
}

export function composeScanSummary(
  input: ComposeScanSummaryInput,
): ScanSummary {
  validateInput(input);
  const counts = countDecisions(input.decisions);
  return {
    state: deriveState(input, counts),
    decisionIds: input.decisions.map(({ id }) => id),
    counts,
    retrieval: input.retrieval,
    modelState: input.modelState,
    assistanceMode: input.assistanceMode,
    dataMode: input.dataMode,
    summaryRuleVersion: "summary-v1",
  };
}
