import type { ProviderId, RetrievalStatus } from "../providers";
import type { ScanSummary } from "../results";

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
  /\b(?:cpsc|fda|nhtsa)[- ]approved\b/i,
  /\bapproved by (?:cpsc|fda|nhtsa)\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?open recalls?\b/i,
  /\b(?:no\s+)?open recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?unrepaired recalls?\b/i,
  /\bunrepaired recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bsafe\b/i,
];

function normalizeCopyForPolicy(copy: string): string {
  return copy
    .normalize("NFKC")
    .replace(/[\s\u00a0]+/gu, " ")
    .replace(/[\u2010-\u2015\u2212]/gu, "-");
}

function hasValidQueryCounts(retrieval: RetrievalStatus): boolean {
  return (
    Number.isInteger(retrieval.requiredQueries) &&
    Number.isInteger(retrieval.completedQueries) &&
    retrieval.requiredQueries >= 0 &&
    retrieval.completedQueries >= 0 &&
    retrieval.completedQueries <= retrieval.requiredQueries
  );
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
  return Object.values(summary.counts).every((count) => count === 0);
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
  if (
    summary.state !== "no_match_found" ||
    summary.decisionIds.length > 0 ||
    !hasOnlyZeroCounts(summary)
  ) {
    throw new Error("No-match copy requires a real no-match summary");
  }

  if (!hasValidQueryCounts(summary.retrieval)) {
    throw new Error("Retrieval query counts are inconsistent");
  }

  if (
    !hasCompleteRetrieval(summary.retrieval) ||
    new Set(summary.retrieval.fullyCompletedProviderIds).size !==
      summary.retrieval.fullyCompletedProviderIds.length
  ) {
    throw new Error(
      "No-match copy requires complete retrieval with named completed sources",
    );
  }

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
