import { describe, expect, it } from "vitest";
import { composeScanSummary } from "@/domain/matching/compose-scan-summary";
import {
  assertAppCopyAllowed,
  formatNoMatchCopy,
} from "@/domain/safety/copy-policy";

function noMatchSummary(
  providerIds: readonly ("cpsc" | "fda_food" | "nhtsa")[] = ["cpsc"],
) {
  return composeScanSummary({
    decisions: [],
    retrieval: {
      completeness: "complete",
      requiredQueries: providerIds.length,
      completedQueries: providerIds.length,
      fullyCompletedProviderIds: providerIds,
      capped: false,
      truncated: false,
    },
    modelState: "model_ready",
    assistanceMode: "manual_mode",
    dataMode: "current_query",
  });
}

describe("app-authored safety copy", () => {
  it.each([
    "This product is safe.",
    "All clear",
    "Not recalled",
    "No recalls found",
    "Real-time recall coverage",
    "Complete coverage",
    "AI verified",
    "AI‑verified",
    "CPSC approved",
    "CPSC–approved",
    "Approved by FDA",
    "Approved by the FDA",
    "Food and Drug Administration approved",
    "Consumer Product Safety Commission approved",
    "National Highway Traffic Safety Administration approved",
    "government approved",
    "agency-approved",
    "Approved by a government agency",
    "Approved by an agency",
    "Federally approved",
    "Received agency approval",
    "This VIN has an open recall.",
    "VIN 1HGCM82633A004352 has no open recalls.",
    "There is an open recall on this VIN.",
    "This VIN has an unrepaired recall.",
    "There are unrepaired recalls on this VIN.",
  ])("rejects prohibited language: %s", (copy) => {
    expect(() => assertAppCopyAllowed(copy)).toThrow(
      /Prohibited app-authored copy/,
    );
  });

  it("allows the exact non-safety no-match template", () => {
    const copy = formatNoMatchCopy(
      noMatchSummary(),
      new Date("2026-01-02T03:04:05.000Z"),
    );

    expect(copy).toBe(
      "No matching record was found in all named sources that completed successfully as of 2026-01-02T03:04:05.000Z. This does not establish that the product is safe or unaffected. Sources completed: CPSC.",
    );
    expect(() => assertAppCopyAllowed(copy)).not.toThrow();
  });

  it("exempts only the exact required disclaimer", () => {
    expect(() =>
      assertAppCopyAllowed(
        "This does not establish that the product is safe or unaffected.",
      ),
    ).not.toThrow();
    expect(() =>
      assertAppCopyAllowed(
        "This does not establish that the product is safe and unaffected.",
      ),
    ).toThrow(/Prohibited app-authored copy/);
    expect(() =>
      assertAppCopyAllowed(
        "This does not establish that the product is safe or unaffected. It is safe.",
      ),
    ).toThrow(/Prohibited app-authored copy/);
  });

  it("normalizes whitespace and dash variants before checking prohibited copy", () => {
    expect(() => assertAppCopyAllowed("AI\u00a0verified")).toThrow(
      /Prohibited app-authored copy/,
    );
    expect(() => assertAppCopyAllowed("CPSC—approved")).toThrow(
      /Prohibited app-authored copy/,
    );
    expect(() => assertAppCopyAllowed("AI\u058Averified")).toThrow(
      /Prohibited app-authored copy/,
    );
    expect(() => assertAppCopyAllowed("sa\u200bfe")).toThrow(
      /Prohibited app-authored copy/,
    );
    expect(() =>
      assertAppCopyAllowed(
        "This does not establish that the product is sa\u200bfe or unaffected.",
      ),
    ).toThrow(/Prohibited app-authored copy/);
  });

  it.each([
    ["empty object", {}],
    [
      "missing key",
      { confirmed_match: 0, possible_match: 0, identifier_conflict: 0 },
    ],
    [
      "extra key",
      {
        confirmed_match: 0,
        possible_match: 0,
        identifier_conflict: 0,
        vehicle_campaigns_found: 0,
        other: 0,
      },
    ],
    [
      "negative",
      {
        confirmed_match: -1,
        possible_match: 0,
        identifier_conflict: 0,
        vehicle_campaigns_found: 0,
      },
    ],
    [
      "NaN",
      {
        confirmed_match: Number.NaN,
        possible_match: 0,
        identifier_conflict: 0,
        vehicle_campaigns_found: 0,
      },
    ],
    [
      "Infinity",
      {
        confirmed_match: Number.POSITIVE_INFINITY,
        possible_match: 0,
        identifier_conflict: 0,
        vehicle_campaigns_found: 0,
      },
    ],
    [
      "fractional",
      {
        confirmed_match: 0.5,
        possible_match: 0,
        identifier_conflict: 0,
        vehicle_campaigns_found: 0,
      },
    ],
  ])("refuses %s decision counts", (_label, counts) => {
    const summary = noMatchSummary();

    expect(() =>
      formatNoMatchCopy({ ...summary, counts } as never, new Date()),
    ).toThrow(/decision counts/);
  });

  it.each([
    [
      "unavailable",
      {
        completeness: "unavailable",
        capped: false,
        truncated: false,
        completedQueries: 0,
      },
    ],
    [
      "partial",
      {
        completeness: "partial",
        capped: false,
        truncated: false,
        completedQueries: 1,
      },
    ],
    [
      "capped",
      {
        completeness: "complete",
        capped: true,
        truncated: false,
        completedQueries: 1,
      },
    ],
    [
      "truncated",
      {
        completeness: "complete",
        capped: false,
        truncated: true,
        completedQueries: 1,
      },
    ],
    [
      "incomplete",
      {
        completeness: "complete",
        capped: false,
        truncated: false,
        completedQueries: 0,
      },
    ],
    [
      "unnamed",
      {
        completeness: "complete",
        capped: false,
        truncated: false,
        completedQueries: 1,
        fullyCompletedProviderIds: [],
      },
    ],
  ] as const)("refuses no-match copy for a %s retrieval", (_label, status) => {
    const summary = noMatchSummary();

    expect(() =>
      formatNoMatchCopy(
        { ...summary, retrieval: { ...summary.retrieval, ...status } },
        new Date(),
      ),
    ).toThrow(/complete retrieval/);
  });

  it("refuses summaries that are not a real no-match outcome", () => {
    const summary = noMatchSummary();

    expect(() =>
      formatNoMatchCopy({ ...summary, state: "not_evaluated" }, new Date()),
    ).toThrow(/no-match summary/);
    expect(() =>
      formatNoMatchCopy(
        {
          ...summary,
          decisionIds: ["record-1"],
          counts: { ...summary.counts, confirmed_match: 1 },
        },
        new Date(),
      ),
    ).toThrow(/no-match summary/);
  });

  it("refuses invalid retrieval counts and timestamps", () => {
    const summary = noMatchSummary();

    expect(() =>
      formatNoMatchCopy(
        {
          ...summary,
          retrieval: { ...summary.retrieval, requiredQueries: 0.5 },
        },
        new Date(),
      ),
    ).toThrow(/query counts/);
    expect(() => formatNoMatchCopy(summary, new Date("invalid"))).toThrow(
      /valid retrieval timestamp/,
    );
  });

  it.each([
    ["unknown provider", { fullyCompletedProviderIds: ["other"] }],
    ["numeric flag", { capped: 0 }],
    ["malformed provider IDs", { fullyCompletedProviderIds: "cpsc" }],
  ])("rejects formatter retrieval with %s", (_label, retrievalPatch) => {
    const summary = noMatchSummary();

    expect(() =>
      formatNoMatchCopy(
        {
          ...summary,
          retrieval: { ...summary.retrieval, ...retrievalPatch },
        } as never,
        new Date(),
      ),
    ).toThrow(/Retrieval status/);
  });

  it("keeps completed source labels in the summary order", () => {
    const copy = formatNoMatchCopy(
      noMatchSummary(["nhtsa", "cpsc", "fda_food"]),
      new Date("2026-01-02T03:04:05.000Z"),
    );

    expect(copy).toContain(
      "Sources completed: NHTSA, CPSC, FDA food enforcement.",
    );
  });
});
