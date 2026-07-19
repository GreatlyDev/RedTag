export type ScanStage =
  "capture" | "understand" | "complete_proof" | "route" | "verify" | "act";
export type InputMode = "camera" | "photos" | "manual";
export type ImageInputMode = Extract<InputMode, "camera" | "photos">;
export type ProductCategory =
  "household_consumer_product" | "food_infant_formula" | "car_light_vehicle";

export interface EvidenceImage {
  readonly id: string;
  readonly label: string;
  readonly mimeType: "image/jpeg";
  readonly size: number;
  readonly objectUrl: string;
  readonly sanitizedFile: File;
  readonly createdAt: number;
}

export interface ScanSessionState {
  readonly stage: ScanStage;
  readonly inputMode: InputMode | null;
  readonly imageInputMode: ImageInputMode | null;
  readonly images: readonly EvidenceImage[];
  readonly manualValue: string;
  readonly selectedCategory: ProductCategory | null;
  readonly notice: string | null;
}

export type ScanSessionAction =
  | {
      readonly type: "images_added";
      readonly inputMode: ImageInputMode;
      readonly images: readonly EvidenceImage[];
      readonly selectionExceeded?: boolean;
    }
  | { readonly type: "image_removed"; readonly id: string }
  | { readonly type: "manual_value_changed"; readonly value: string }
  | { readonly type: "manual_submitted" }
  | { readonly type: "category_selected"; readonly category: ProductCategory }
  | { readonly type: "notice_set"; readonly notice: string }
  | { readonly type: "notice_cleared" }
  | { readonly type: "reset" };
