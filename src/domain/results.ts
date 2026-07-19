import type { FieldComparison, IdentifierKind } from "./evidence";
import type {
  AssistanceMode,
  DataMode,
  ModelState,
  ProviderId,
  RetrievalStatus,
} from "./providers";

export type ResultDecision =
  | "confirmed_match"
  | "possible_match"
  | "identifier_conflict"
  | "vehicle_campaigns_found";

export type ScanState =
  | "not_evaluated"
  | ResultDecision
  | "no_match_found"
  | "insufficient_identifier"
  | "unsupported";

export type PossibleMatchReason =
  "user_evidence_missing" | "record_not_unit_verifiable";
export type AllowedAction =
  | "add_evidence"
  | "retry_source"
  | "open_official_source"
  | "open_nhtsa_vin_lookup";

interface DecisionBase<P extends ProviderId> {
  readonly id: string;
  readonly provider: P;
  readonly providerRecordId: string;
  readonly sourceUrl: string;
  readonly matchedFields: readonly FieldComparison<P>[];
  readonly conflictingFields: readonly FieldComparison<P>[];
  readonly unknownFields: readonly IdentifierKind[];
  readonly ruleVersion: string;
  readonly limitations: readonly string[];
  readonly allowedActions: readonly AllowedAction[];
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
}

type CpscDecisionBase = DecisionBase<"cpsc"> & {
  readonly providerProductEntryId: string;
};

type FdaDecisionBase = DecisionBase<"fda_food"> & {
  readonly providerProductEntryId?: never;
};

type NhtsaDecisionBase = DecisionBase<"nhtsa"> & {
  readonly providerProductEntryId?: never;
};

type MatchDecisionBase = CpscDecisionBase | FdaDecisionBase;

export type RecordDecision =
  | (MatchDecisionBase & {
      readonly result: "confirmed_match";
      readonly possibleMatchReason?: never;
    })
  | (MatchDecisionBase & {
      readonly result: "possible_match";
      readonly possibleMatchReason: PossibleMatchReason;
    })
  | (MatchDecisionBase & {
      readonly result: "identifier_conflict";
      readonly possibleMatchReason?: never;
    })
  | (NhtsaDecisionBase & {
      readonly result: "vehicle_campaigns_found";
      readonly possibleMatchReason?: never;
      readonly allowedActions: readonly [
        "open_nhtsa_vin_lookup",
        ...AllowedAction[],
      ];
    });

export type DecisionCounts = Readonly<Record<ResultDecision, number>>;

export interface ScanSummary {
  readonly state: ScanState;
  readonly decisionIds: readonly string[];
  readonly counts: DecisionCounts;
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
  readonly summaryRuleVersion: "summary-v1";
}
