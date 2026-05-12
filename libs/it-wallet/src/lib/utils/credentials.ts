import { t } from 'i18next';
import { ItwCredentialStatus, ItwJwtCredentialStatus } from '../types';
import { ParsedDcql } from './itwTypesUtils';
import { CredentialType } from './itwMocksUtils';

export type CredentialsKeys = 'DRIVING_LICENSE' | 'PID' | 'DISABILITY_CARD';

/**
 * Map which, for each wallet available credential, stores its corresponding
 * credential type. It is used to distinguish a credential from the other for
 * rendering and localization purposes.
 */
export const wellKnownCredential = {
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'urn:eu.europa.ec.eudi:pid:1',
  DISABILITY_CARD: 'urn:eu.europa.ec.eudi:edc:1'
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
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'dc_sd_jwt_PersonIdentificationData',
  DISABILITY_CARD: 'dc_sd_jwt_EuropeanDisabilityCard'
};

/**
 * Map that stores for a subset of the various credentials supported their
 * corresponding namespace for {@link ParsedCredential} extraction
 */
export const wellKnownCredentialNamespaces: Partial<
  Record<CredentialsKeys, string>
> = {
  DRIVING_LICENSE: 'org.iso.18013.5.1'
};

/**
 * Map from VCT values to credential configuration IDs.
 * Used to resolve which credential to issue when a DCQL query
 * reports a missing credential by its VCT.
 */
const vctToConfigId: Record<string, string> = Object.fromEntries(
  (Object.keys(wellKnownCredential) as Array<CredentialsKeys>).map(key => [
    wellKnownCredential[key],
    wellKnownCredentialConfigurationIDs[key]
  ])
);

/**
 * Given a list of VCT values, returns the first matching credential configuration ID.
 * Returns undefined if no match is found.
 */
export const getConfigIdByVct = (
  vctValues: Array<string>
): string | undefined => {
  for (const vct of vctValues) {
    const configId = vctToConfigId[vct];
    if (configId) {
      return configId;
    }
  }
  return undefined;
};

export const getCredentialNameByType = (type?: string): string => {
  switch (type) {
    case wellKnownCredential.DRIVING_LICENSE:
      return t(['credentials.names.mdl'], { ns: 'wallet' });
    case wellKnownCredential.PID:
      return t(['credentials.names.pid'], { ns: 'wallet' });
    case wellKnownCredential.DISABILITY_CARD:
      return t(['credentials.names.disabilityCard'], { ns: 'wallet' });
    default:
      return t(['credentials.names.unknown'], { ns: 'wallet' });
  }
};

const EXCLUDED_CREDENTIAL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  'expired',
  'expiring',
  'invalid',
  'unknown'
];

/**
 * Determines which credential status should be displayed in the UI
 * based on the current pid status and offline conditions.
 *
 * Logic summary:
 * - Excluded statuses ("expired", "expiring", "invalid", "unknown") are never overridden.
 * - Online:
 *   - Show actual credential status if pid is valid.
 *   - Otherwise, show "valid".
 *
 * @param credentialStatus The actual credential status
 * @param pidStatus The current pid status
 * @param isOffline Whether the app is operating offline
 * @returns {ItwCredentialStatus}The display status for the credential
 */
export const getItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus,
  pidStatus: ItwJwtCredentialStatus | undefined
): ItwCredentialStatus => {
  // Excluded statuses are never overridden
  if (EXCLUDED_CREDENTIAL_STATUSES.includes(credentialStatus)) {
    return credentialStatus;
  }

  const isPidValid = pidStatus === 'valid';

  // Invalid pid → treat as "valid"
  if (!isPidValid) {
    return 'valid';
  }

  // Default: pid valid and online → keep real status
  return credentialStatus;
};

// TODO: [SIW-3998] Remove when MDOC remote presentation will be supported
export const isPresentationDetailSdJwt = <T extends ParsedDcql[number]>(
  input: T
): input is Extract<T, { format: 'dc+sd-jwt' }> => input.format === 'dc+sd-jwt';

/**
 * Maps a vct name to the corresponding credential type, used in UI contexts
 * Note: although this list is unlikely to change, you should ensure to have
 * a fallback when dealing with this list to prevent unwanted behaviours
 */
const credentialTypesByVct: { [vct: string]: CredentialType } = {
  personidentificationdata: CredentialType.PID,
  mdl: CredentialType.DRIVING_LICENSE,
  europeandisabilitycard: CredentialType.EUROPEAN_DISABILITY_CARD
};

/**
 * Utility function which returns the credentila type associated to the provided vct
 * @param vct credential vct
 * @returns credential type as string, undefine if not found
 */
export const getCredentialTypeByVct = (vct: string): string | undefined => {
  // Extracts the name from the vct. For example:
  // From "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata"
  // Gets "/vct/v1.0.0/personidentificationdata"
  const match = vct.match(/\/vct(.*)\/([^/]+)$/);
  // Extracts "personidentificationdata"
  const name = match ? match[2] : null;
  // Tries to match the extracted value to a credential type
  return name ? credentialTypesByVct[name] : undefined;
};
