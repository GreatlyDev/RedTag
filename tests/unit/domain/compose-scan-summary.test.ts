import { describe, expect, it } from "vitest";
import { composeScanSummary } from "@/domain/matching/compose-scan-summary";
import type { AssistanceMode, DataMode, ModelState } from "@/domain/providers";
import type { RecordDecision, ResultDecision } from "@/domain/results";

const completeRetrieval = {
  completeness: "complete" as const,
  requiredQueries: 1,
  completedQueries: 1,
  fullyCompletedProviderIds: ["cpsc"] as const,
  capped: false,
  truncated: false,
};

function decision(
  id: string,
  result: ResultDecision,
  dataMode: DataMode = "current_query",
  modelState: ModelState = "model_ready",
  assistanceMode: AssistanceMode = "assisted",
): RecordDecision {
  const common = {
    id,
    providerRecordId: `record-${id}`,
    sourceUrl: `https://example.gov/records/${id}`,
    conflictingFields: [],
    unknownFields: [],
    ruleVersion: "foundation-v1",
    limitations: [],
    retrieval: completeRetrieval,
    modelState,
    assistanceMode,
    dataMode,
  };

  if (result === "vehicle_campaigns_found") {
    return {
      ...common,
      provider: "nhtsa",
      result,
      matchedFields: [
        {
          kind: "vin",
          userValue: "1HGCM82633A004352",
          officialValue: "1HGCM82633A004352",
          provenance: { provider: "nhtsa", sourceField: "Results[0].Model" },
        },
      ],
      allowedActions: ["open_nhtsa_vin_lookup"],
    };
  }

  if (result === "possible_match") {
    return {
      ...common,
      provider: "cpsc",
      result,
      providerProductEntryId: `entry-${id}`,
      matchedFields: [
        {
          kind: "model",
          userValue: "MODEL-1",
          officialValue: "MODEL-1",
          provenance: {
            provider: "cpsc",
            sourceField: "products.model_number",
            productEntryId: `entry-${id}`,
          },
        },
      ],
      possibleMatchReason: "user_evidence_missing",
      allowedActions: ["add_evidence", "open_official_source"],
    };
  }

  return {
    ...common,
    provider: "cpsc",
    result,
    providerProductEntryId: `entry-${id}`,
    matchedFields: [
      {
        kind: "model",
        userValue: "MODEL-1",
        officialValue: "MODEL-1",
        provenance: {
          provider: "cpsc",
          sourceField: "products.model_number",
          productEntryId: `entry-${id}`,
        },
      },
    ],
    allowedActions: ["open_official_source"],
  };
}

describe("composeScanSummary", () => {
  it("keeps the workflow not evaluated when no provider completed", () => {
    const summary = composeScanSummary({
      decisions: [],
      retrieval: {
        ...completeRetrieval,
        completeness: "unavailable",
        completedQueries: 0,
        fullyCompletedProviderIds: [],
      },
      modelState: "model_unavailable",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("not_evaluated");
  });

  it("gives confirmed match precedence without deleting lower-precedence decisions", () => {
    const summary = composeScanSummary({
      decisions: [
        decision("possible", "possible_match"),
        decision("confirmed", "confirmed_match"),
      ],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("confirmed_match");
    expect(summary.decisionIds).toEqual(["possible", "confirmed"]);
    expect(summary.counts).toMatchObject({
      confirmed_match: 1,
      possible_match: 1,
    });
  });

  it("gives possible match precedence over an identifier conflict", () => {
    const summary = composeScanSummary({
      decisions: [
        decision("conflict", "identifier_conflict", "recorded_response"),
        decision("possible", "possible_match", "recorded_response"),
      ],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "recorded_response",
    });

    expect(summary.state).toBe("possible_match");
    expect(summary.dataMode).toBe("recorded_response");
  });

  it("allows no match only after complete uncapped and untruncated retrieval", () => {
    const complete = composeScanSummary({
      decisions: [],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });
    const partial = composeScanSummary({
      decisions: [],
      retrieval: {
        ...completeRetrieval,
        completeness: "partial",
        fullyCompletedProviderIds: [],
        truncated: true,
      },
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });

    expect(complete.state).toBe("no_match_found");
    expect(partial.state).toBe("not_evaluated");
  });

  it("preserves a valid record decision when another required query is incomplete", () => {
    const summary = composeScanSummary({
      decisions: [decision("confirmed", "confirmed_match")],
      retrieval: {
        ...completeRetrieval,
        completeness: "partial",
        requiredQueries: 2,
        completedQueries: 1,
        fullyCompletedProviderIds: [],
        truncated: true,
      },
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("confirmed_match");
    expect(summary.retrieval.completeness).toBe("partial");
  });

  it("preserves deterministic pre-evaluation endings", () => {
    const summary = composeScanSummary({
      decisions: [],
      retrieval: {
        ...completeRetrieval,
        completeness: "unavailable",
        requiredQueries: 0,
        completedQueries: 0,
        fullyCompletedProviderIds: [],
      },
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
      preEvaluationState: "unsupported",
    });

    expect(summary.state).toBe("unsupported");
  });

  it.each([
    ["identifier_conflict", "identifier_conflict"],
    ["vehicle_campaigns_found", "vehicle_campaigns_found"],
  ] as const)("preserves the %s terminal family", (result, expected) => {
    const summary = composeScanSummary({
      decisions: [decision(result, result)],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe(expected);
  });

  it.each([
    "confirmed_match",
    "possible_match",
    "identifier_conflict",
    "vehicle_campaigns_found",
  ] as const)("preserves %s when retrieval is incomplete", (result) => {
    const summary = composeScanSummary({
      decisions: [decision(result, result)],
      retrieval: {
        ...completeRetrieval,
        completeness: "partial",
        fullyCompletedProviderIds: [],
        capped: true,
        truncated: true,
      },
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe(result);
  });

  it("rejects a zero-query retrieval labeled complete", () => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: {
          ...completeRetrieval,
          requiredQueries: 0,
          completedQueries: 0,
        },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/complete retrieval/);
  });

  it.each([
    ["negative", { requiredQueries: -1, completedQueries: 0 }],
    ["fractional", { requiredQueries: 1, completedQueries: 0.5 }],
    ["inverted", { requiredQueries: 1, completedQueries: 2 }],
  ] as const)("rejects %s retrieval counts", (_label, counts) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: { ...completeRetrieval, ...counts },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/query counts/);
  });

  it.each([
    ["capped", { capped: true }],
    ["truncated", { truncated: true }],
    ["incomplete", { completedQueries: 0 }],
    ["unnamed", { fullyCompletedProviderIds: [] }],
  ] as const)("rejects a complete retrieval that is %s", (_label, override) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: { ...completeRetrieval, ...override },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/complete retrieval/);
  });

  it("rejects stale pre-evaluation state after a record decision", () => {
    expect(() =>
      composeScanSummary({
        decisions: [decision("confirmed", "confirmed_match")],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
        preEvaluationState: "unsupported",
      }),
    ).toThrow(/pre-evaluation/);
  });

  it.each([
    [
      "completed queries",
      { completedQueries: 1, fullyCompletedProviderIds: [] },
    ],
    [
      "completed providers",
      { completedQueries: 0, fullyCompletedProviderIds: ["cpsc"] },
    ],
  ] as const)("rejects pre-evaluation state with %s", (_label, retrieval) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: {
          ...completeRetrieval,
          completeness: "unavailable",
          ...retrieval,
        },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
        preEvaluationState: "insufficient_identifier",
      }),
    ).toThrow(/pre-evaluation/);
  });

  it("rejects unavailable model state paired with assisted mode", () => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: {
          ...completeRetrieval,
          completeness: "unavailable",
          completedQueries: 0,
          fullyCompletedProviderIds: [],
        },
        modelState: "model_unavailable",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/manual mode/);
  });

  it("allows a ready model paired with manual mode", () => {
    expect(
      composeScanSummary({
        decisions: [],
        retrieval: {
          ...completeRetrieval,
          completeness: "unavailable",
          completedQueries: 0,
          fullyCompletedProviderIds: [],
        },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }).state,
    ).toBe("not_evaluated");
  });

  it("rejects a decision whose model state disagrees with the scan", () => {
    expect(() =>
      composeScanSummary({
        decisions: [
          decision(
            "confirmed",
            "confirmed_match",
            "current_query",
            "model_unavailable",
            "manual_mode",
          ),
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/operational axes/);
  });

  it("rejects a decision whose assistance mode disagrees with the scan", () => {
    expect(() =>
      composeScanSummary({
        decisions: [
          decision(
            "confirmed",
            "confirmed_match",
            "current_query",
            "model_ready",
            "assisted",
          ),
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/operational axes/);
  });

  it("rejects a decision whose data mode disagrees with the scan", () => {
    expect(() =>
      composeScanSummary({
        decisions: [
          decision("possible", "possible_match", "recorded_response"),
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/operational axes/);
  });

  it("rejects a record decision without a completed query", () => {
    expect(() =>
      composeScanSummary({
        decisions: [decision("confirmed", "confirmed_match")],
        retrieval: {
          ...completeRetrieval,
          completeness: "partial",
          completedQueries: 0,
          fullyCompletedProviderIds: [],
        },
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/completed query/);
  });

  it("rejects duplicate decision and completed-provider identifiers", () => {
    expect(() =>
      composeScanSummary({
        decisions: [
          decision("same", "confirmed_match"),
          decision("same", "possible_match"),
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/decision IDs/);

    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: {
          ...completeRetrieval,
          fullyCompletedProviderIds: ["cpsc", "cpsc"],
        },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/provider IDs/);
  });

  it("does not mutate frozen input", () => {
    const retrieval = Object.freeze({
      ...completeRetrieval,
      fullyCompletedProviderIds: Object.freeze(["cpsc"] as const),
    });
    const decisions = Object.freeze([decision("confirmed", "confirmed_match")]);
    const input = Object.freeze({
      decisions,
      retrieval,
      modelState: "model_ready" as const,
      assistanceMode: "assisted" as const,
      dataMode: "current_query" as const,
    });

    const summary = composeScanSummary(input);

    expect(summary.decisionIds).toEqual(["confirmed"]);
    expect(input.decisions).toBe(decisions);
    expect(input.retrieval).toBe(retrieval);
  });
});
