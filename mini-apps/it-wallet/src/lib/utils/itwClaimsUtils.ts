/**
 * Utility functions for working with credential claims.
 */

import { differenceInCalendarDays, isValid } from 'date-fns';
import { t } from 'i18next';

import { claimScheme, parseClaims } from './claims';
import { isPresentationDetailSdJwt } from './credentials';
import { ClaimDisplayFormat } from './itwRemotePresentationUtils';
import {
  ClaimDisplayResult,
  EnrichedPresentationDetails,
  isDefined,
  ParsedCredential,
  ParsedDcql,
  StoredCredentialMetadata
} from './itwTypesUtils';

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
   *  Claim that contains the barcode
   */
  barcode = 'barcode',
  /**
   * Claim used to display the attachments of a credential (currently used for the European Health Insurance Card)
   */
  content = 'content',
  document_number = 'document_number',
  /**
   * Claim that contains the driving privilege within the new nested structure
   */
  driving_privileges = 'driving_privileges',
  /**
   * Claim used to extract expiry date from a credential. This is used to display how many days are left for
   * the credential expiration or to know if the credential is expired
   */
  expiry_date = 'expiry_date',
  /**
   * Claims that contains the document number, if applicable for the credential
   */

  /**
   * Claim that contains the family name, if applicable for the credential
   */
  family_name = 'family_name',

  fiscal_code = 'fiscal_code',
  /**
   * Claim that contains the first name, if applicable for the credential
   */
  given_name = 'given_name',
  /**
   * Claim used to display a QR Code for the Disability Card. It must be excluded from the common claims list
   * and rendered using a {@link QRCodeImage} (currently used for the European Disability Card)
   */
  link_qr_code = 'link_qr_code',
  /**
   * Claim that contains the portrait image
   */
  portrait = 'portrait',
  /**
   * Claim that contains signature usual mark
   */
  signature_usual_mark = 'signature_usual_mark',
  /**
   * Claim that contains the fiscal code, used for checks based on the user's identity.
   */
  tax_id_code = 'tax_id_code',
  /**
   * Unique ID must be excluded from every credential and should not rendered in the claims list
   */
  unique_id = 'unique_id'
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

/**
 *
 *
 *
 * CLAIMS LOCALE UTILS
 *
 *
 *
 */

/**
 * Enrich the result of the presentation request evaluation with localized claim names for UI display.
 *
 * @param presentationDetails The presentation details with the credentials to present
 * @param credentialsByType A credentials map to extract the localized claim names
 * @returns The enriched presentation details
 */
export const enrichPresentationDetails = (
  presentationDetails: ParsedDcql,
  credentialsByType: StoredCredentialMetadata[]
): EnrichedPresentationDetails =>
  presentationDetails.filter(isPresentationDetailSdJwt).map(details => {
    const credentialType = details.vct;
    const credential =
      credentialType &&
      credentialsByType.find(c => c.credentialType === credentialType);

    // When the credential is not found, it is not available as a `StoredCredential`, so we hide it from the user.
    // The raw credential is still used for the presentation. Currently this only happens for the Wallet Attestation.
    if (!credential) {
      return {
        ...details,
        claimsToDisplay: []
      };
    }

    const parsedClaims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id]
    });

    return {
      ...details,
      // Only include claims that are part of the parsed credential
      // This ensures that technical claims like `iat` are not displayed to the user
      claimsToDisplay: details.requiredDisclosures
        .map(({ name: claimName }) =>
          parsedClaims.find(({ id }) => id === claimName)
        )
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
      case 'boolean':
        return {
          type: 'text',
          value: t(`presentation.credentialDetails.boolClaim.${parsed.value}`, {
            ns: 'wallet'
          })
        };

      case 'date':
      case 'expireDate':
        return {
          type: 'text',
          value: parsed.value.toLocaleDateString()
        };

      case 'drivingPrivileges': {
        const categories = parsed.value
          .map(v => v.vehicle_category_code)
          .join(', ');
        return {
          type: 'text',
          value: categories
        };
      }

      case 'emptyString':
        return {
          type: 'text',
          value: ''
        };

      case 'image':
        return {
          type: 'image',
          value: parsed.value
        };

      case 'placeOfBirth':
        return {
          type: 'text',
          value: `${parsed.value}`
        };

      case 'string':
        return {
          type: 'text',
          value: parsed.value
        };

      case 'stringArray':
        return {
          type: 'text',
          value: parsed.value.join(', ')
        };

      case 'verificationEvidence':
        return {
          type: 'text',
          value: parsed.value.organization_name
        };

      default:
        return {
          type: 'text',
          value: t(
            'verifiableCredentials.generic.placeholders.claimNotAvailable',
            { ns: 'wallet' }
          )
        };
    }
  } catch {
    return {
      type: 'text',
      value: t('verifiableCredentials.generic.placeholders.claimNotAvailable', {
        ns: 'wallet'
      })
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SIMPLE_DATE_FORMAT = {
  DDMMYY: 'DD/MM/YY',
  DDMMYYYY: 'DD/MM/YYYY'
} as const;

export type SimpleDateFormat =
  (typeof SIMPLE_DATE_FORMAT)[keyof typeof SIMPLE_DATE_FORMAT];
