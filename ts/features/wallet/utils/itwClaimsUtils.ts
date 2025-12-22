/**
 * Utility functions for working with credential claims.
 */

import { isValid } from 'date-fns';
import { ParsedCredential } from "./types";

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
  unique_id = "unique_id",
  /**
   * Claim used to extract expiry date from a credential. This is used to display how many days are left for
   * the credential expiration or to know if the credential is expired
   */
  expiry_date = "expiry_date",
  /**
   * Claim used to display a QR Code for the Disability Card. It must be excluded from the common claims list
   * and rendered using a {@link QRCodeImage} (currently used for the European Disability Card)
   */
  link_qr_code = "link_qr_code",
  /**
   * Claim used to display the attachments of a credential (currently used for the European Health Insurance Card)
   */
  content = "content",
  /**
   * Claim that contains the fiscal code, used for checks based on the user's identity.
   */
  tax_id_code = "tax_id_code",
  /**
   * Claims that contains the document number, if applicable for the credential
   */
  document_number = "document_number",
  /**
   * Claim that contains the first name, if applicable for the credential
   */
  given_name = "given_name",
  /**
   * Claim that contains the family name, if applicable for the credential
   */
  family_name = "family_name",
  /**
   * Claim that contains the portrait image
   */
  portrait = "portrait",
  /**
   * Claim that contains the driving privilege within the new nested structure
   */
  driving_privileges = "driving_privileges"
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