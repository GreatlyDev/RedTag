export const IDENTIFIER_KINDS = [
  "brand",
  "product_name",
  "manufacturer",
  "product_type",
  "model",
  "upc_gtin",
  "lot_batch",
  "serial",
  "date",
  "size",
  "variant",
  "vin",
] as const;

export type IdentifierKind = (typeof IDENTIFIER_KINDS)[number];

export interface ConfirmedIdentifier {
  readonly id: string;
  readonly kind: IdentifierKind;
  readonly raw: string;
  readonly normalized: string;
  readonly userConfirmed: boolean;
  readonly sourceImageId?: string;
  readonly quotedText?: string;
  readonly ambiguityNote?: string;
}

import type { ProviderId } from "./providers";

export type FieldProvenance =
  | {
      readonly provider: "cpsc";
      readonly sourceField: string;
      readonly productEntryId: string;
    }
  | {
      readonly provider: "fda_food";
      readonly sourceField: string;
      readonly span: { readonly start: number; readonly end: number };
      readonly productLineSegmentId: string;
      readonly parserRule: string;
    }
  | {
      readonly provider: "nhtsa";
      readonly sourceField: string;
    };

export interface FieldComparison<P extends ProviderId = ProviderId> {
  readonly kind: IdentifierKind;
  readonly userValue: string;
  readonly officialValue: string | null;
  readonly provenance: Extract<FieldProvenance, { readonly provider: P }>;
}
