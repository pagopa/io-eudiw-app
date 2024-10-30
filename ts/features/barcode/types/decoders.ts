import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Credential } from "@pagopa/io-react-native-wallet";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { IOBarcodeType } from "./IOBarcode";

export type DecodedIOBarcode = {
  type: "ITWALLET";
  clientId: string;
  requestUri: string;
};

// Barcode decoder function which is used to determine the type and content of a barcode
type IOBarcodeDecoderFn = (data: string) => O.Option<DecodedIOBarcode>;

type IOBarcodeDecodersType = {
  [K in IOBarcodeType]: IOBarcodeDecoderFn;
};

const decodeItWalletBarcode: IOBarcodeDecoderFn = (data: string) =>
  pipe(
    data.match(/^[a-zA-Z0-9+/]+={0,2}$/),
    O.fromNullable,
    O.map(m =>
      E.tryCatch(
        () => Credential.Presentation.startFlowFromQR(m[0]),
        () => new Error("Failed to decode auth request QR")
      )
    ),
    O.chain(O.fromEither),
    O.fold(
      () => O.none,
      m =>
        O.some({
          type: "ITWALLET",
          clientId: m.clientId,
          requestUri: m.requestURI
        })
    )
  );

export const IOBarcodeDecoders: IOBarcodeDecodersType = {
  ITWALLET: decodeItWalletBarcode
};

type DecodeOptions = {
  /**
   * List of barcode types to decode
   * If not specified, all barcode types are decoded
   */
  barcodeTypes?: ReadonlyArray<IOBarcodeType>;
};

/**
 * Returns the type of a barcode. Fallbacks to "UNKNOWN" if no type is found
 * @param value Barcode content
 * @returns DecodedIOBarcode {@see DecodedIOBarcode
 */
export const decodeIOBarcode = (
  value: string | undefined,
  options?: DecodeOptions
): O.Option<DecodedIOBarcode> =>
  pipe(
    value,
    O.fromNullable,
    O.map(NonEmptyString.decode),
    O.chain(O.fromEither),
    O.map(data =>
      Object.entries(IOBarcodeDecoders)
        .filter(
          ([type]) =>
            options?.barcodeTypes?.includes(type as IOBarcodeType) ?? true
        )
        .map(([_, decode]) => decode(data.trim()))
    ),
    O.map(A.compact),
    O.chain(A.head)
  );
