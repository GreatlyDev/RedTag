import { describe, expect, it } from "vitest";
import { APP_NAME, APP_PROMISE } from "@/app/product-copy";

describe("project contract", () => {
  it("exposes the approved product identity without a safety claim", () => {
    expect(APP_NAME).toBe("RedTag");
    expect(APP_PROMISE).toBe(
      "Scan a supported item. Verify the evidence. Know what to do next.",
    );
    expect(APP_PROMISE.toLowerCase()).not.toContain("safe");
  });
});
