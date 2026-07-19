import {
  ASSISTANCE_MODES,
  assertValidRetrievalStatus,
  DATA_MODES,
  MODEL_STATES,
  type ProviderId,
  type RetrievalStatus,
} from "../providers";
import { RESULT_DECISIONS, type ScanSummary } from "../results";

const REQUIRED_NO_MATCH_DISCLAIMER =
  "This does not establish that the product is safe or unaffected.";

const PROVIDER_NAMES: Readonly<Record<ProviderId, string>> = {
  cpsc: "CPSC",
  fda_food: "FDA food enforcement",
  nhtsa: "NHTSA",
};

const PROHIBITED_APP_COPY: readonly RegExp[] = [
  /\ball clear\b/i,
  /\bnot recalled\b/i,
  /\bno recalls?\b/i,
  /\breal[- ]time\b/i,
  /\bcomplete coverage\b/i,
  /\bai[- ]verified\b/i,
  /\b(?:the )?(?:cpsc|fda|nhtsa|food and drug administration|consumer product safety commission|national highway traffic safety administration|agency|government|federal)[- ]approved\b/i,
  /\bapproved by (?:the )?(?:cpsc|fda|nhtsa|food and drug administration|consumer product safety commission|national highway traffic safety administration|agency|government|federal)\b/i,
  /\bfederal approval\b/i,
  /\b(?:federally|agency|government) approved\b/i,
  /\bapproved by (?:an? )?(?:government )?agency\b/i,
  /\breceived (?:an? )?(?:government )?agency approval\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?open recalls?\b/i,
  /\b(?:no\s+)?open recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?unrepaired recalls?\b/i,
  /\bunrepaired recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bsafe\b/i,
];

function normalizeCopyForPolicy(copy: string): string {
  return copy
    .normalize("NFKC")
    .replace(/[\p{Dash_Punctuation}\u2212]/gu, " ")
    .replace(/\p{Default_Ignorable_Code_Point}/gu, "")
    .replace(/[\s\u00a0]+/gu, " ");
}

function hasCompleteRetrieval(retrieval: RetrievalStatus): boolean {
  return (
    retrieval.completeness === "complete" &&
    retrieval.requiredQueries > 0 &&
    retrieval.completedQueries === retrieval.requiredQueries &&
    retrieval.fullyCompletedProviderIds.length > 0 &&
    !retrieval.capped &&
    !retrieval.truncated
  );
}

function hasOnlyZeroCounts(summary: ScanSummary): boolean {
  const counts = summary.counts;
  if (counts === null || typeof counts !== "object" || Array.isArray(counts)) {
    return false;
  }

  const keys = Reflect.ownKeys(counts);
  return (
    keys.length === RESULT_DECISIONS.length &&
    RESULT_DECISIONS.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(counts, key) &&
        Number.isInteger(counts[key]) &&
        counts[key] === 0,
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertNoMatchSummary(value: unknown): asserts value is ScanSummary {
  if (!isRecord(value) || value.state !== "no_match_found") {
    throw new Error("No-match copy requires a real no-match summary");
  }
  if (
    !Array.isArray(value.decisionIds) ||
    value.decisionIds.length !== 0 ||
    !value.decisionIds.every((id) => typeof id === "string") ||
    value.summaryRuleVersion !== "summary-v1" ||
    !MODEL_STATES.includes(value.modelState as never) ||
    !ASSISTANCE_MODES.includes(value.assistanceMode as never) ||
    !DATA_MODES.includes(value.dataMode as never) ||
    (value.modelState === "model_unavailable" &&
      value.assistanceMode !== "manual_mode")
  ) {
    throw new Error("No-match copy requires a real no-match summary");
  }
  if (!hasOnlyZeroCounts(value as unknown as ScanSummary)) {
    throw new Error("No-match copy requires exhaustive zero decision counts");
  }
  assertValidRetrievalStatus(value.retrieval);
  if (!hasCompleteRetrieval(value.retrieval)) {
    throw new Error(
      "No-match copy requires complete retrieval with named completed sources",
    );
  }
}

export function assertAppCopyAllowed(copy: string): void {
  const copyWithoutRequiredDisclaimer = copy
    .split(REQUIRED_NO_MATCH_DISCLAIMER)
    .join("");
  const normalizedCopy = normalizeCopyForPolicy(copyWithoutRequiredDisclaimer);
  const violation = PROHIBITED_APP_COPY.find((pattern) =>
    pattern.test(normalizedCopy),
  );
  if (violation) {
    throw new Error(`Prohibited app-authored copy matched ${violation.source}`);
  }
}

export function formatNoMatchCopy(
  summary: ScanSummary,
  retrievedAt: Date,
): string {
  assertNoMatchSummary(summary);

  if (Number.isNaN(retrievedAt.getTime())) {
    throw new Error("No-match copy requires a valid retrieval timestamp");
  }

  const names = summary.retrieval.fullyCompletedProviderIds.map(
    (provider) => PROVIDER_NAMES[provider],
  );
  const copy = `No matching record was found in all named sources that completed successfully as of ${retrievedAt.toISOString()}. ${REQUIRED_NO_MATCH_DISCLAIMER} Sources completed: ${names.join(", ")}.`;

  assertAppCopyAllowed(copy);
  return copy;
}
