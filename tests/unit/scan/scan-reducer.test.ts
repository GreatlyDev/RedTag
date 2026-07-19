import { describe, expect, it } from "vitest";
import {
  initialScanSession,
  scanReducer,
} from "@/features/scan/model/scan-reducer";
import type { EvidenceImage } from "@/features/scan/model/types";

function image(id: string): EvidenceImage {
  const sanitizedFile = new File(["sanitized"], `${id}.jpg`, {
    type: "image/jpeg",
    lastModified: 0,
  });
  return {
    id,
    label: `Evidence ${id}`,
    mimeType: "image/jpeg",
    size: sanitizedFile.size,
    objectUrl: `blob:${id}`,
    sanitizedFile,
    createdAt: 0,
  };
}

describe("scanReducer", () => {
  it("keeps no more than two evidence images", () => {
    const state = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "photos",
      images: [image("1"), image("2"), image("3")],
    });
    expect(state.images.map(({ id }) => id)).toEqual(["1", "2"]);
    expect(state.notice).toBe(
      "Two images maximum. Remove one before adding another.",
    );
  });

  it("reports an oversized selection even when accepted files fit remaining slots", () => {
    const state = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "photos",
      images: [image("1")],
      selectionExceeded: true,
    });
    expect(state.images).toHaveLength(1);
    expect(state.notice).toBe(
      "Two images maximum. Remove one before adding another.",
    );
  });

  it("keeps manual identifiers editable and advances only to evidence review", () => {
    const edited = scanReducer(initialScanSession(), {
      type: "manual_value_changed",
      value: "  ABC-123  ",
    });
    const continued = scanReducer(edited, { type: "manual_submitted" });
    expect(continued).toMatchObject({
      manualValue: "ABC-123",
      stage: "complete_proof",
      inputMode: "manual",
    });
  });

  it("does not submit an empty manual identifier", () => {
    const state = scanReducer(initialScanSession(), {
      type: "manual_submitted",
    });
    expect(state.stage).toBe("capture");
    expect(state.notice).toBe(
      "Enter a model, UPC or GTIN, lot code, date, or VIN.",
    );
  });

  it("clearing manual text keeps image evidence and restores its image input mode", () => {
    const withImage = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("1")],
    });
    const submitted = scanReducer(
      scanReducer(withImage, {
        type: "manual_value_changed",
        value: "ABC-123",
      }),
      { type: "manual_submitted" },
    );
    const cleared = scanReducer(submitted, {
      type: "manual_value_changed",
      value: "",
    });
    expect(cleared.images).toHaveLength(1);
    expect(cleared).toMatchObject({
      stage: "understand",
      inputMode: "camera",
      imageInputMode: "camera",
    });
  });

  it("resets every ephemeral field", () => {
    const withImage = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("1")],
    });
    expect(scanReducer(withImage, { type: "reset" })).toEqual(
      initialScanSession(),
    );
  });

  it("returns to capture when the final image is removed", () => {
    const withImage = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("1")],
    });
    const removed = scanReducer(withImage, { type: "image_removed", id: "1" });
    expect(removed.images).toEqual([]);
    expect(removed).toMatchObject({
      stage: "capture",
      inputMode: null,
      imageInputMode: null,
    });
  });

  it("preserves the active image mode when one image remains", () => {
    const withImages = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "photos",
      images: [image("1"), image("2")],
    });
    const removed = scanReducer(withImages, { type: "image_removed", id: "1" });
    expect(removed.images.map(({ id }) => id)).toEqual(["2"]);
    expect(removed).toMatchObject({ stage: "understand", inputMode: "photos" });
  });

  it("demotes an emptied manual-only session and covers explicit notices", () => {
    const submitted = scanReducer(
      scanReducer(initialScanSession(), {
        type: "manual_value_changed",
        value: "ABC-123",
      }),
      { type: "manual_submitted" },
    );
    const emptied = scanReducer(submitted, {
      type: "manual_value_changed",
      value: "",
    });
    const noticed = scanReducer(emptied, {
      type: "notice_set",
      notice: "Try another photo.",
    });
    const cleared = scanReducer(noticed, { type: "notice_cleared" });
    expect(emptied).toMatchObject({ stage: "capture", inputMode: null });
    expect(cleared.notice).toBeNull();
  });

  it("records a typed confirmed category without selecting a provider", () => {
    const state = scanReducer(initialScanSession(), {
      type: "category_selected",
      category: "food_infant_formula",
    });
    expect(state.selectedCategory).toBe("food_infant_formula");
    expect(state).not.toHaveProperty("selectedProvider");
  });
});
