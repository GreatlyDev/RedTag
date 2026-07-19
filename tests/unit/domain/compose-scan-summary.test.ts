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
      conflictingFields: [],
      unknownFields: [],
      matchedFields: [
        {
          kind: "model",
          userValue: "ACCORD",
          officialValue: "ACCORD",
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
      conflictingFields: [],
      unknownFields: ["lot_batch"],
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
    conflictingFields:
      result === "identifier_conflict"
        ? [
            {
              kind: "upc_gtin",
              userValue: "000",
              officialValue: "111",
              provenance: {
                provider: "cpsc",
                sourceField: "products.upc",
                productEntryId: `entry-${id}`,
              },
            },
          ]
        : [],
    unknownFields: [],
    matchedFields: [
      {
        kind: "upc_gtin",
        userValue: "00012345678905",
        officialValue: "00012345678905",
        provenance: {
          provider: "cpsc",
          sourceField: "products.upc",
          productEntryId: `entry-${id}`,
        },
      },
    ],
    allowedActions: ["open_official_source"],
  };
}

function fdaDecision(): RecordDecision {
  return {
    id: "fda-decision",
    provider: "fda_food",
    result: "confirmed_match",
    providerRecordId: "fda-record",
    sourceUrl: "https://example.gov/fda-record",
    matchedFields: [
      {
        kind: "lot_batch",
        userValue: "LOT-1",
        officialValue: "LOT-1",
        provenance: {
          provider: "fda_food",
          sourceField: "code_info",
          span: { start: 0, end: 5 },
          productLineSegmentId: "line-1",
          parserRule: "lot-token-v1",
        },
      },
    ],
    conflictingFields: [],
    unknownFields: [],
    ruleVersion: "foundation-v1",
    limitations: [],
    allowedActions: ["open_official_source"],
    retrieval: completeRetrieval,
    modelState: "model_ready",
    assistanceMode: "assisted",
    dataMode: "current_query",
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

  it.each([
    [
      "forged NHTSA confirmation",
      {
        ...decision("nhtsa", "vehicle_campaigns_found"),
        result: "confirmed_match",
      },
    ],
    [
      "forged CPSC vehicle campaign",
      {
        ...decision("cpsc", "confirmed_match"),
        result: "vehicle_campaigns_found",
      },
    ],
    [
      "unknown provider",
      { ...decision("unknown-provider", "confirmed_match"), provider: "other" },
    ],
    [
      "unknown result",
      { ...decision("unknown-result", "confirmed_match"), result: "other" },
    ],
  ])("rejects %s runtime decision discriminants", (_label, forged) => {
    expect(() =>
      composeScanSummary({
        decisions: [forged as unknown as RecordDecision],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/decision/);
  });

  it("rejects CPSC evidence joined across product entries", () => {
    const cpsc = decision("cross-entry", "confirmed_match");
    const forged = {
      ...cpsc,
      matchedFields: [
        {
          ...cpsc.matchedFields[0],
          provenance: {
            provider: "cpsc",
            sourceField: "products.model_number",
            productEntryId: "other-entry",
          },
        },
      ],
    };

    expect(() =>
      composeScanSummary({
        decisions: [forged as unknown as RecordDecision],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/product entry/);
  });

  it("rejects FDA evidence crossed between product-line segments", () => {
    const fda = fdaDecision();
    const forged = {
      ...fda,
      conflictingFields: [
        {
          ...fda.matchedFields[0]!,
          provenance: {
            ...fda.matchedFields[0]!.provenance,
            productLineSegmentId: "line-2",
          },
        },
      ],
    };

    expect(() =>
      composeScanSummary({
        decisions: [forged as unknown as RecordDecision],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/product-line segment/);
  });

  it.each([
    ["invalid FDA span", { span: { start: 4, end: 4 } }],
    ["wrong FDA provenance", { provider: "cpsc" }],
  ])("rejects %s", (_label, provenance) => {
    const fda = fdaDecision();
    const forged = {
      ...fda,
      matchedFields: [{ ...fda.matchedFields[0], provenance }],
    };

    expect(() =>
      composeScanSummary({
        decisions: [forged as unknown as RecordDecision],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/FDA/);
  });

  it.each([
    [
      "NHTSA action on CPSC",
      {
        ...decision("bad-action", "confirmed_match"),
        allowedActions: ["open_nhtsa_vin_lookup"],
      },
    ],
    [
      "non-leading NHTSA lookup",
      {
        ...decision("nhtsa-action", "vehicle_campaigns_found"),
        allowedActions: ["open_official_source", "open_nhtsa_vin_lookup"],
      },
    ],
    [
      "invalid decision retrieval",
      {
        ...decision("bad-retrieval", "confirmed_match"),
        retrieval: { ...completeRetrieval, requiredQueries: 0.5 },
      },
    ],
    [
      "unknown identifier kind",
      { ...decision("bad-kind", "confirmed_match"), unknownFields: ["other"] },
    ],
    [
      "possible reason on confirmed result",
      {
        ...decision("bad-reason", "confirmed_match"),
        possibleMatchReason: "user_evidence_missing",
      },
    ],
  ])("rejects %s", (_label, forged) => {
    expect(() =>
      composeScanSummary({
        decisions: [forged as unknown as RecordDecision],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/decision|retrieval|actions|identifier/i);
  });

  it.each([
    ["an unknown completed provider", { fullyCompletedProviderIds: ["other"] }],
    ["a non-boolean cap flag", { capped: "false" }],
  ])("rejects a decision retrieval with %s", (_label, retrievalPatch) => {
    expect(() =>
      composeScanSummary({
        decisions: [
          {
            ...decision("malformed-retrieval", "confirmed_match"),
            retrieval: {
              ...completeRetrieval,
              ...retrievalPatch,
            },
          } as unknown as RecordDecision,
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/retrieval/i);
  });

  it.each([
    ["outer model state", { modelState: "other" }],
    ["outer assistance mode", { assistanceMode: "other" }],
    ["outer data mode", { dataMode: "other" }],
    ["unknown pre-evaluation state", { preEvaluationState: "other" }],
  ])("rejects an unknown %s", (_label, patch) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
        ...patch,
      } as never),
    ).toThrow(/axis|pre-evaluation/i);
  });

  it.each([
    ["model state", { modelState: "other" }],
    ["assistance mode", { assistanceMode: "other" }],
    ["data mode", { dataMode: "other" }],
  ])("rejects a decision with an unknown %s", (_label, patch) => {
    expect(() =>
      composeScanSummary({
        decisions: [
          { ...decision("bad-axis", "confirmed_match"), ...patch },
        ] as never,
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/decision.*axis/i);
  });

  it("rejects a decision without its own completed retrieval query", () => {
    expect(() =>
      composeScanSummary({
        decisions: [
          {
            ...decision("no-local-retrieval", "confirmed_match"),
            retrieval: {
              ...completeRetrieval,
              completeness: "unavailable",
              completedQueries: 0,
              fullyCompletedProviderIds: [],
            },
          },
        ],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/decision retrieval/i);
  });

  it.each([
    [
      "empty confirmed evidence",
      { ...decision("c", "confirmed_match"), matchedFields: [] },
    ],
    [
      "confirmed conflict",
      {
        ...decision("c", "confirmed_match"),
        conflictingFields: decision("c", "identifier_conflict")
          .conflictingFields,
      },
    ],
    [
      "empty conflict evidence",
      { ...decision("i", "identifier_conflict"), conflictingFields: [] },
    ],
    [
      "empty possible unknowns",
      { ...decision("p", "possible_match"), unknownFields: [] },
    ],
    [
      "empty campaign evidence",
      { ...decision("v", "vehicle_campaigns_found"), matchedFields: [] },
    ],
    [
      "VIN campaign evidence",
      {
        ...decision("v", "vehicle_campaigns_found"),
        matchedFields: [
          {
            ...decision("v", "vehicle_campaigns_found").matchedFields[0]!,
            kind: "vin",
          },
        ],
      },
    ],
    [
      "campaign conflict",
      {
        ...decision("v", "vehicle_campaigns_found"),
        conflictingFields: [
          {
            kind: "model",
            userValue: "ACCORD",
            officialValue: "CIVIC",
            provenance: { provider: "nhtsa", sourceField: "Results[0].Model" },
          },
        ],
      },
    ],
  ])("rejects %s", (_label, forged) => {
    expect(() =>
      composeScanSummary({
        decisions: [forged] as never,
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/evidence basis/);
  });
});
