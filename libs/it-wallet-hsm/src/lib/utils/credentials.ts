import { ParsedDcql } from './itwTypesUtils';

export type CredentialsKeys =
  | 'BONUS_PARI'
  | 'DISABILITY_CARD'
  | 'DRIVING_LICENSE'
  | 'PID';

/**
 * Map which, for each wallet available credential, stores its corresponding
 * credential type. It is used to distinguish a credential from the other for
 * rendering and localization purposes.
 */
export const wellKnownCredential = {
  BONUS_PARI: 'urn:pagopa:pari-bonus:1',
  DISABILITY_CARD: 'urn:eu.europa.ec.eudi:edc:1',
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'urn:eudi:pid:it:1'
} as const satisfies Record<CredentialsKeys, string>;

/**
 * Type derived from the {@link wellKnownCredential} object
 * representing the supported credential types
 */
export type WellKnownCredentialTypes =
  (typeof wellKnownCredential)[keyof typeof wellKnownCredential];

/**
 * Map which, for each wallet available credential, stores its corresponding ID
 * int the Entity Configuration. Used to start issuance flows.
 */
export const wellKnownCredentialConfigurationIDs: Record<
  CredentialsKeys,
  string
> = {
  BONUS_PARI: 'dc_sd_jwt_PariBonus',
  DISABILITY_CARD: 'dc_sd_jwt_EuropeanDisabilityCard',
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'dc_sd_jwt_PersonIdentificationData'
};

/**
 * Map from VCT values to credential configuration IDs.
 * Used to resolve which credential to issue when a DCQL query
 * reports a missing credential by its VCT.
 */
const vctToConfigId: Record<string, string> = Object.fromEntries(
  (Object.keys(wellKnownCredential) as CredentialsKeys[]).map(key => [
    wellKnownCredential[key],
    wellKnownCredentialConfigurationIDs[key]
  ])
);

/**
 * Reverse map from credential configuration ID to its corresponding credential
 * type (VCT / scope). Used to check whether a credential advertised by an offer
 * has already been obtained.
 */
const configIdToCredentialType: Record<string, string> = Object.fromEntries(
  (Object.keys(wellKnownCredential) as CredentialsKeys[]).map(key => [
    wellKnownCredentialConfigurationIDs[key],
    wellKnownCredential[key]
  ])
);

/**
 * Given a credential configuration ID (as advertised in a credential offer),
 * returns the corresponding credential type, or undefined when the configuration
 * ID does not match any of the well known credentials.
 */
export const getCredentialTypeByConfigId = (
  configId: string
): string | undefined => configIdToCredentialType[configId];

/**
 * Given a list of VCT values, returns the first matching credential configuration ID.
 * Returns undefined if no match is found.
 */
export const getConfigIdByVct = (vctValues: string[]): string | undefined => {
  for (const vct of vctValues) {
    const configId = vctToConfigId[vct];
    if (configId) {
      return configId;
    }
  }
  return undefined;
};

// TODO: [SIW-3998] Remove when MDOC remote presentation will be supported
export const isPresentationDetailSdJwt = <T extends ParsedDcql[number]>(
  input: T
): input is Extract<T, { format: 'dc+sd-jwt' }> => input.format === 'dc+sd-jwt';
