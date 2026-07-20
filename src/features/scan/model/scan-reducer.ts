import type { ScanSessionAction, ScanSessionState } from "./types";

export const MAX_EVIDENCE_IMAGES = 2;

export function initialScanSession(): ScanSessionState {
  return {
    stage: "capture",
    inputMode: null,
    imageInputMode: null,
    images: [],
    manualValue: "",
    manualSubmitted: false,
    selectedCategory: null,
    notice: null,
  };
}

export function scanReducer(
  state: ScanSessionState,
  action: ScanSessionAction,
): ScanSessionState {
  switch (action.type) {
    case "images_added": {
      const combined = [...state.images, ...action.images];
      const exceedsLimit =
        action.selectionExceeded === true ||
        combined.length > MAX_EVIDENCE_IMAGES;
      return {
        ...state,
        stage: "understand",
        inputMode: action.inputMode,
        imageInputMode: action.inputMode,
        images: combined.slice(0, MAX_EVIDENCE_IMAGES),
        notice: exceedsLimit
          ? "Two images maximum. Remove one before adding another."
          : null,
      };
    }
    case "image_removed": {
      const images = state.images.filter(({ id }) => id !== action.id);
      const hasImages = images.length > 0;
      const hasSubmittedManual =
        state.manualSubmitted && state.manualValue.trim() !== "";
      return {
        ...state,
        images,
        stage: hasImages
          ? "understand"
          : hasSubmittedManual
            ? "complete_proof"
            : "capture",
        inputMode: hasImages
          ? state.imageInputMode
          : hasSubmittedManual
            ? "manual"
            : null,
        imageInputMode: hasImages ? state.imageInputMode : null,
        notice: null,
      };
    }
    case "manual_value_changed": {
      const manualValue = action.value;
      return state.images.length > 0
        ? {
            ...state,
            manualValue,
            manualSubmitted: false,
            stage: "understand",
            inputMode: state.imageInputMode,
            notice: null,
          }
        : {
            ...state,
            manualValue,
            manualSubmitted: false,
            stage: "capture",
            inputMode: null,
            imageInputMode: null,
            notice: null,
          };
    }
    case "manual_submitted": {
      const manualValue = state.manualValue.trim();
      return manualValue
        ? {
            ...state,
            stage: "complete_proof",
            inputMode: "manual",
            manualValue,
            manualSubmitted: true,
            notice: null,
          }
        : {
            ...state,
            manualSubmitted: false,
            notice: "Enter a model, UPC or GTIN, lot code, date, or VIN.",
          };
    }
    case "category_selected":
      return { ...state, selectedCategory: action.category, notice: null };
    case "notice_set":
      return { ...state, notice: action.notice };
    case "notice_cleared":
      return { ...state, notice: null };
    case "reset":
      return initialScanSession();
  }
}
