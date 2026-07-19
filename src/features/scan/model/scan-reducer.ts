import type { ScanSessionAction, ScanSessionState } from "./types";

export const MAX_EVIDENCE_IMAGES = 2;

export function initialScanSession(): ScanSessionState {
  return {
    stage: "capture",
    inputMode: null,
    imageInputMode: null,
    images: [],
    manualValue: "",
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
      const noEvidence = images.length === 0 && state.manualValue.trim() === "";
      return {
        ...state,
        images,
        stage: noEvidence
          ? "capture"
          : images.length > 0
            ? "understand"
            : state.stage,
        inputMode: noEvidence
          ? null
          : images.length > 0
            ? state.imageInputMode
            : state.inputMode,
        imageInputMode: images.length === 0 ? null : state.imageInputMode,
        notice: null,
      };
    }
    case "manual_value_changed": {
      const manualValue = action.value;
      if (manualValue.trim() !== "")
        return { ...state, manualValue, notice: null };
      return state.images.length > 0
        ? {
            ...state,
            manualValue,
            stage: "understand",
            inputMode: state.imageInputMode,
            notice: null,
          }
        : {
            ...state,
            manualValue,
            stage: "capture",
            inputMode: null,
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
            notice: null,
          }
        : {
            ...state,
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
