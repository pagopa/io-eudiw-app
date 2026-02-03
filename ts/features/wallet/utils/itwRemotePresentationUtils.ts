import { Credential } from '@pagopa/io-react-native-wallet';
import { EnrichedPresentationDetails, ParsedCredential } from './itwTypesUtils';

/**
 * Type representing the parsed DCQL query with the presentation details
 */
export type PresentationDetails = Awaited<
  ReturnType<Credential.Presentation.EvaluateDcqlQuery>
>;

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
  value: Array<ParsedCredential>;
};

/**
 * Union type for claim display format, either flat or nested
 */
export type ClaimDisplayFormat =
  | FlatClaimDisplayFormat
  | NestedArrayClaimDisplayFormat;

type PresentationDetail = EnrichedPresentationDetails[number];

/**
 * Given the details of a presentation, group credentials by purpose for the UI.
 *
 * @param presentationDetails The details of the presentation with the requested credentials
 * @returns An object with required and optional credentials grouped by purpose
 */
export const groupCredentialsByPurpose = (
  presentationDetails: EnrichedPresentationDetails
) => {
  const required = {} as Record<string, Array<PresentationDetail>>;
  const optional = {} as Record<string, Array<PresentationDetail>>;

  for (const item of presentationDetails) {
    for (const purpose of item.purposes) {
      const target = purpose.required ? required : optional;
      // eslint-disable-next-line functional/immutable-data
      target[purpose.description ?? ''] ??= [];
      // eslint-disable-next-line functional/immutable-data
      target[purpose.description ?? ''].push(item);
    }
  }

  return {
    required: Object.entries(required).map(([purpose, credentials]) => ({
      purpose,
      credentials
    })),
    optional: Object.entries(optional).map(([purpose, credentials]) => ({
      purpose,
      credentials
    }))
  };
};
