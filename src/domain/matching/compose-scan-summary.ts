import type {
  AssistanceMode,
  DataMode,
  ModelState,
  ProviderId,
  RetrievalStatus,
} from "../providers";
import { assertValidRetrievalStatus, PROVIDER_IDS } from "../providers";
import { IDENTIFIER_KINDS } from "../evidence";
import type {
  AllowedAction,
  DecisionCounts,
  RecordDecision,
  ResultDecision,
  ScanState,
  ScanSummary,
} from "../results";
import { RESULT_DECISIONS } from "../results";

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

const ALLOWED_ACTIONS = [
  "add_evidence",
  "retry_source",
  "open_official_source",
  "open_nhtsa_vin_lookup",
] as const satisfies readonly AllowedAction[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === "string" && PROVIDER_IDS.includes(value as ProviderId)
  );
}

function isResultDecision(value: unknown): value is ResultDecision {
  return (
    typeof value === "string" &&
    RESULT_DECISIONS.includes(value as ResultDecision)
  );
}

function isIdentifierKind(value: unknown): boolean {
  return typeof value === "string" && IDENTIFIER_KINDS.includes(value as never);
}

function isAllowedAction(value: unknown): value is AllowedAction {
  return (
    typeof value === "string" &&
    ALLOWED_ACTIONS.includes(value as AllowedAction)
  );
}

function assertDecisionFields(decision: Record<string, unknown>): void {
  if (
    !isText(decision.id) ||
    !isText(decision.providerRecordId) ||
    !isText(decision.ruleVersion) ||
    !isText(decision.sourceUrl) ||
    !isProviderId(decision.provider) ||
    !isResultDecision(decision.result) ||
    !Array.isArray(decision.matchedFields) ||
    !Array.isArray(decision.conflictingFields) ||
    !Array.isArray(decision.unknownFields) ||
    !Array.isArray(decision.limitations) ||
    !Array.isArray(decision.allowedActions)
  ) {
    throw new Error("Invalid decision shape");
  }

  if (
    !decision.unknownFields.every(isIdentifierKind) ||
    !decision.limitations.every(isText) ||
    !decision.allowedActions.every(isAllowedAction)
  ) {
    throw new Error("Invalid decision arrays, identifier kind, or actions");
  }
}

function assertPossibleMatchReason(decision: Record<string, unknown>): void {
  const validReason =
    decision.possibleMatchReason === "user_evidence_missing" ||
    decision.possibleMatchReason === "record_not_unit_verifiable";
  if (
    decision.result === "possible_match"
      ? !validReason
      : decision.possibleMatchReason !== undefined
  ) {
    throw new Error("Invalid decision possible match reason");
  }
}

function assertProviderResultAndActions(
  decision: Record<string, unknown>,
): void {
  const actions = decision.allowedActions as readonly unknown[];
  if (decision.provider === "nhtsa") {
    if (
      decision.result !== "vehicle_campaigns_found" ||
      decision.providerProductEntryId !== undefined ||
      actions[0] !== "open_nhtsa_vin_lookup"
    ) {
      throw new Error(
        "Invalid NHTSA decision result, product entry, or actions",
      );
    }
    return;
  }

  if (
    decision.result === "vehicle_campaigns_found" ||
    actions.includes("open_nhtsa_vin_lookup")
  ) {
    throw new Error("Invalid provider-inappropriate decision action");
  }

  if (
    decision.provider === "cpsc" &&
    !isText(decision.providerProductEntryId)
  ) {
    throw new Error("CPSC decision requires a product entry");
  }

  if (
    decision.provider === "fda_food" &&
    decision.providerProductEntryId !== undefined
  ) {
    throw new Error("Invalid FDA decision product entry");
  }
}

function assertComparisonShape(
  value: unknown,
  provider: unknown,
): Record<string, unknown> {
  if (
    !isRecord(value) ||
    !isIdentifierKind(value.kind) ||
    !isText(value.userValue)
  ) {
    throw new Error("Invalid decision comparison");
  }
  if (value.officialValue !== null && !isText(value.officialValue)) {
    throw new Error("Invalid decision comparison official value");
  }
  if (!isRecord(value.provenance) || !isText(value.provenance.sourceField)) {
    throw new Error(
      provider === "fda_food"
        ? "Invalid FDA provenance"
        : "Invalid decision provenance",
    );
  }
  return value.provenance;
}

function assertCpscProvenance(
  provenance: Record<string, unknown>,
  productEntryId: unknown,
): void {
  if (
    provenance.provider !== "cpsc" ||
    !isText(provenance.productEntryId) ||
    provenance.productEntryId !== productEntryId
  ) {
    throw new Error("CPSC product entry provenance must match the decision");
  }
}

function assertFdaProvenance(provenance: Record<string, unknown>): string {
  const span = provenance.span;
  const start = isRecord(span) ? span.start : undefined;
  const end = isRecord(span) ? span.end : undefined;
  if (
    provenance.provider !== "fda_food" ||
    !isText(provenance.productLineSegmentId) ||
    !isText(provenance.parserRule) ||
    !isRecord(span) ||
    typeof start !== "number" ||
    typeof end !== "number" ||
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end <= start
  ) {
    throw new Error("Invalid FDA provenance");
  }
  return provenance.productLineSegmentId;
}

function assertDecisionProvenance(decision: Record<string, unknown>): void {
  const comparisons = [
    ...(decision.matchedFields as readonly unknown[]),
    ...(decision.conflictingFields as readonly unknown[]),
  ];
  let fdaSegment: string | undefined;

  for (const comparison of comparisons) {
    const provenance = assertComparisonShape(comparison, decision.provider);
    if (decision.provider === "cpsc") {
      assertCpscProvenance(provenance, decision.providerProductEntryId);
    } else if (decision.provider === "fda_food") {
      const segment = assertFdaProvenance(provenance);
      if (fdaSegment && fdaSegment !== segment) {
        throw new Error("FDA decision cannot cross product-line segments");
      }
      fdaSegment = segment;
    } else if (provenance.provider !== "nhtsa") {
      throw new Error("Invalid NHTSA provenance");
    }
  }
}

function validateDecision(decision: unknown): void {
  if (!isRecord(decision)) throw new Error("Invalid decision shape");
  assertDecisionFields(decision);
  assertPossibleMatchReason(decision);
  assertValidRetrievalStatus(decision.retrieval);
  assertProviderResultAndActions(decision);
  assertDecisionProvenance(decision);
}

function validateInput(input: ComposeScanSummaryInput): void {
  const { retrieval } = input;
  assertValidRetrievalStatus(retrieval);
  for (const decision of input.decisions) validateDecision(decision);

  if (
    retrieval.completeness === "complete" &&
    !hasValidCompleteRetrieval(retrieval)
  ) {
    throw new Error(
      "A complete retrieval requires completed uncapped and untruncated queries",
    );
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
