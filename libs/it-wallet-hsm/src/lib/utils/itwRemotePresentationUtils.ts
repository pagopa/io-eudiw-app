import { EnrichedPresentationDetails, ParsedCredential } from './itwTypesUtils';

/**
 * Union type for claim display format, either flat or nested
 */
export type ClaimDisplayFormat =
  | FlatClaimDisplayFormat
  | NestedArrayClaimDisplayFormat;

/**
 * Flat claim that contains a primitive value or an array of primitives
 */
export type FlatClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

/**
 * Nested claim that contains an array of objects (ParsedCredential)
 */
export type NestedArrayClaimDisplayFormat = {
  id: string;
  label: string;
  value: ParsedCredential[];
};

type PresentationDetail = EnrichedPresentationDetails[number];

/**
 * Given the details of a presentation, group credentials by purpose for the UI.
 *
 * @param presentationDetails The details of the presentation with the requested credentials
 * @returns An object with required and optional credentials grouped by purpose
 */
export const groupCredentialsByPurpose = (
  presentationDetails: EnrichedPresentationDetails
): {
  optional: { credentials: PresentationDetail[]; purpose: string }[];
  required: { credentials: PresentationDetail[]; purpose: string }[];
} => {
  const required = {} as Record<string, PresentationDetail[]>;
  const optional = {} as Record<string, PresentationDetail[]>;

  for (const item of presentationDetails) {
    for (const purpose of item.purposes) {
      const target = purpose.required ? required : optional;
      target[purpose.description ?? ''] ??= [];
      target[purpose.description ?? ''].push(item);
    }
  }

  return {
    optional: Object.entries(optional).map(([purpose, credentials]) => ({
      credentials,
      purpose
    })),
    required: Object.entries(required).map(([purpose, credentials]) => ({
      credentials,
      purpose
    }))
  };
};
