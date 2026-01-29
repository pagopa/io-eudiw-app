/* eslint-disable no-console */
/**
 * Utility functions for working with credential claims.
 */

import { differenceInCalendarDays, isValid } from 'date-fns';
import z from 'zod';
import i18next from 'i18next';
import {
  ClaimDisplayResult,
  EnrichedPresentationDetails,
  isDefined,
  ParsedCredential,
  PresentationDetails,
  StoredCredential
} from './itwTypesUtils';
import { ClaimDisplayFormat } from './itwRemotePresentationUtils';
import { wellKnownCredential } from './credentials';
import { validCredentialStatuses } from './itwCredentialUtils';
import { CredentialType } from './itwMocksUtils';
import { claimScheme, parseClaims } from './claims';
import { getCredentialStatus } from './itwCredentialStatusUtils';

/**
 *
 *
 *
 * CLAIMS MANIPULATION UTILS
 *
 *
 *
 */

/**
 * We strongly discourage direct claim manipulation, but some special cases must be addressed with direct access
 */
export enum WellKnownClaim {
  /**
   * Unique ID must be excluded from every credential and should not rendered in the claims list
   */
  unique_id = 'unique_id',
  /**
   * Claim used to extract expiry date from a credential. This is used to display how many days are left for
   * the credential expiration or to know if the credential is expired
   */
  expiry_date = 'expiry_date',
  /**
   * Claim used to display a QR Code for the Disability Card. It must be excluded from the common claims list
   * and rendered using a {@link QRCodeImage} (currently used for the European Disability Card)
   */
  link_qr_code = 'link_qr_code',
  /**
   * Claim used to display the attachments of a credential (currently used for the European Health Insurance Card)
   */
  content = 'content',
  /**
   * Claim that contains the fiscal code, used for checks based on the user's identity.
   */
  tax_id_code = 'tax_id_code',
  /**
   * Claims that contains the document number, if applicable for the credential
   */
  document_number = 'document_number',
  /**
   * Claim that contains the first name, if applicable for the credential
   */
  given_name = 'given_name',
  /**
   * Claim that contains the family name, if applicable for the credential
   */
  family_name = 'family_name',
  /**
   * Claim that contains the portrait image
   */
  portrait = 'portrait',
  /**
   * Claim that contains the driving privilege within the new nested structure
   */
  driving_privileges = 'driving_privileges',

  /**
   * Claim that contains signature usual mark
   */
  signature_usual_mark = 'signature_usual_mark'
}

/**
 *
 *
 * Expiration date and status
 *
 *
 */

/**
 * Returns the expiration date from a {@see ParsedCredential}, if present
 * @param credential the parsed credential claims
 * @returns a Date if found, undefined if not
 */
export const getCredentialExpireDate = (
  credential: ParsedCredential
): Date | undefined => {
  // A credential could contain its expiration date in `expiry_date`
  const expireDate = credential[WellKnownClaim.expiry_date];

  if (!expireDate?.value) {
    return undefined;
  }

  const date = new Date(expireDate.value as string);
  return isValid(date) ? date : undefined;
};

/**
 * Returns the remaining days until the expiration a {@see ParsedCredential}
 * @param credential the parsed credential claims
 * @returns the number of days until the expiration date, undefined if no expire date is found
 */
export const getCredentialExpireDays = (
  credential: ParsedCredential
): number | undefined => {
  const expireDate = getCredentialExpireDate(credential);

  if (expireDate === undefined) {
    return undefined;
  }

  return differenceInCalendarDays(expireDate, Date.now());
};

const FISCAL_CODE_REGEX =
  /([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z])/g;

/**
 * Extract a fiscal code from any string.
 * @param s - the input string
 * @returns An option with the extracted fiscal code
 */
export const extractFiscalCode = (s: string) => {
  const match = s.match(FISCAL_CODE_REGEX);
  return match?.[0];
};

/**
 *
 *
 * Claim extractors
 *
 *
 */

/**
 * Function that extracts a claim from a credential.
 * @param claimId - the claim id / name to extract
 * @param decoder - optional decoder for the claim value, defaults to decoding a string
 * @returns a function that extracts a claim from a credential
 */
export const extractClaim =
  <T = string>(
    claimId: string,
    decoder: z.ZodType<T> = z.string() as unknown as z.ZodType<T>
  ) =>
  (credential: ParsedCredential): T =>
    decoder.parse(credential[claimId]?.value);

/**
 * Returns the fiscal code from a credential (if applicable)
 * @param credential - the credential
 * @returns the fiscal code
 */
export const getFiscalCodeFromCredential = (
  credential: StoredCredential | undefined
) =>
  credential?.parsedCredential
    ? extractFiscalCode(
        extractClaim(WellKnownClaim.tax_id_code)(credential?.parsedCredential)
      )
    : '';

/**
 * Returns the first name from a credential (if applicable)
 * @param credential - the credential
 * @returns the first name
 */
export const getFirstNameFromCredential = (
  credential: StoredCredential | undefined
) =>
  credential?.parsedCredential
    ? extractClaim(WellKnownClaim.given_name)(credential.parsedCredential)
    : '';

/**
 * Returns the family name from a credential (if applicable)
 * @param credential - the credential
 * @returns the family name
 */
export const getFamilyNameFromCredential = (
  credential: StoredCredential | undefined
) =>
  credential?.parsedCredential
    ? extractClaim(WellKnownClaim.family_name)(credential.parsedCredential)
    : '';

/**
 * CLAIMS LOCALE UTILS
 */

export const SimpleDateFormat = {
  DDMMYYYY: 'DD/MM/YYYY',
  DDMMYY: 'DD/MM/YY'
} as const;

/**
 * Maps a vct name to the corresponding credential type, used in UI contexts
 * Note: although this list is unlikely to change, you should ensure to have
 * a fallback when dealing with this list to prevent unwanted behaviours
 */
const credentialTypesByVct: { [vct: string]: CredentialType } = {
  [wellKnownCredential.PID]: CredentialType.PID,
  [wellKnownCredential.DRIVING_LICENSE]: CredentialType.DRIVING_LICENSE,
  [wellKnownCredential.DISABILITY_CARD]:
    CredentialType.EUROPEAN_DISABILITY_CARD,
  [wellKnownCredential.HEALTHID]: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
};

/**
 * Return a list of credential types that have an invalid status.
 */
export const getInvalidCredentials = (
  presentationDetails: PresentationDetails,
  credentialsByType: Array<StoredCredential>
) =>
  presentationDetails
    // Retries the type from the VCT map
    .map(({ vct }) => (vct ? credentialTypesByVct[vct] : undefined))
    // Removes undefined
    .filter(isDefined)
    // Retrieve the credential using the type from the previous step
    .map(type => credentialsByType.find(c => c.credentialType === type))
    // Removes undefined
    .filter(isDefined)
    // Removes credential with valid statuses
    .filter(c => !validCredentialStatuses.includes(getCredentialStatus(c)))
    // Gets the invalid credential's type
    .map(c => c.credentialType);

/**
 * Enrich the result of the presentation request evaluation with localized claim names for UI display.
 *
 * @param presentationDetails The presentation details with the credentials to present
 * @param credentialsByType A credentials map to extract the localized claim names
 * @returns The enriched presentation details
 */
export const enrichPresentationDetails = (
  presentationDetails: PresentationDetails,
  credentialsByType: Array<StoredCredential>
): EnrichedPresentationDetails =>
  presentationDetails.map(details => {
    const { cryptoContext, ...restDetails } = details;
    const credentialType = details.vct;
    const credential =
      credentialType &&
      credentialsByType.find(c => c.credentialType === credentialType);

    // When the credential is not found, it is not available as a `StoredCredential`, so we hide it from the user.
    // The raw credential is still used for the presentation. Currently this only happens for the Wallet Attestation.
    if (!credential) {
      return {
        ...restDetails,
        claimsToDisplay: [] // Hide from userv gq
      };
    }

    const parsedClaims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id]
    });

    return {
      ...restDetails,
      // Only include claims that are part of the parsed credential
      // This ensures that technical claims like `iat` are not displayed to the user
      claimsToDisplay: details.requiredDisclosures
        .map(([, claimName]) => parsedClaims.find(({ id }) => id === claimName))
        .filter(isDefined)
    };
  });

/**
 * Get the display value of a claim, handling both flat and nested formats.
 */

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): ClaimDisplayResult => {
  try {
    const parsed = claimScheme.parse(claim);

    switch (parsed.type) {
      case 'placeOfBirth':
        return {
          type: 'text',
          value: `${parsed.value.country} ${parsed.value.locality}`.trim()
        };

      case 'date':
      case 'expireDate':
        return {
          type: 'text',
          value: parsed.value.toLocaleDateString()
        };

      case 'image':
        return {
          type: 'image',
          value: parsed.value
        };

      case 'boolean':
        return {
          type: 'text',
          value: i18next.t(
            `presentation.credentialDetails.boolClaim.${parsed.value}`,
            { ns: 'wallet' }
          )
        };

      case 'stringArray':
        return {
          type: 'text',
          value: parsed.value.join(', ')
        };

      case 'drivingPrivileges':
        const categories = parsed.value
          .map(v => v.vehicle_category_code)
          .join(', ');
        return {
          type: 'text',
          value: categories
        };

      case 'string':
        return {
          type: 'text',
          value: parsed.value
        };

      case 'emptyString':
        return {
          type: 'text',
          value: ''
        };

      case 'verificationEvidence':
        return {
          type: 'text',
          value: i18next.t(
            'features.itWallet.generic.placeholders.evidenceAvailable'
          )
        };

      default:
        return {
          type: 'text',
          value: i18next.t(
            'features.itWallet.generic.placeholders.claimNotAvailable'
          )
        };
    }
  } catch (error) {
    console.error('Error parsing claim:', error);
    return {
      type: 'text',
      value: i18next.t('features.itWallet.generic.placeholders.error')
    };
  }
};

/**
 * Thrown when the verifier (RP) is not marked as trusted
 */
export class UntrustedRpError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function assert(
  condition: unknown,
  msg: string = 'Assertion failed'
): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
