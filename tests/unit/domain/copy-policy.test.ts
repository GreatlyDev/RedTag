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
