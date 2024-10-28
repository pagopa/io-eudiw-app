import { DecodedIOBarcode, IOBarcodeDecoders } from "./decoders";

export const IO_BARCODE_ALL_FORMATS = ["QR_CODE"] as const;

export type IOBarcodeFormat = (typeof IO_BARCODE_ALL_FORMATS)[number];

export type IOBarcodeType = DecodedIOBarcode["type"];

export const IO_BARCODE_ALL_TYPES = Object.keys(
  IOBarcodeDecoders
) as ReadonlyArray<IOBarcodeType>;

/**
 * Scanned barcode, it contains the information about the scanned content, its format and its type
 */
export type IOBarcode = {
  format: IOBarcodeFormat;
} & DecodedIOBarcode;

export type IOBarcodeOrigin = "camera";

export enum BarcodeFormat {
  "CODE_128" = "code-128",
  "CODE_39" = "code-39",
  "ITF" = "itf",
  "DATA_MATRIX" = "data-matrix",
  "QR_CODE" = "qr"
}
