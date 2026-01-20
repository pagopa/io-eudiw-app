import i18next from 'i18next';
import { ItwCredentialStatus, ItwJwtCredentialStatus } from '../types';

export type CredentialsKeys =
  | 'DRIVING_LICENSE'
  | 'PID'
  | 'HEALTHID'
  | 'DISABILITY_CARD';

/**
 * Map which, for each wallet available credential, stores its corresponding
 * credential type. It is used to distinguish a credential from the other for
 * rendering and localization purposes.
 */
export const wellKnownCredential: Record<CredentialsKeys, string> = {
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'urn:eu.europa.ec.eudi:pid:1',
  HEALTHID: 'eu.europa.ec.eudi.hiid.1',
  DISABILITY_CARD: 'urn:eu.europa.ec.eudi:edc:1'
};

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
  HEALTHID: 'eu.europa.ec.eudi.hiid.1',
  DISABILITY_CARD: 'dc_sd_jwt_EuropeanDisabilityCard'
};

export const getCredentialNameByType = (type?: string): string => {
  switch (type) {
    case wellKnownCredential.DRIVING_LICENSE:
      return i18next.t(['wallet:credentials.names.mdl']);
    case wellKnownCredential.PID:
      return i18next.t(['wallet:credentials.names.pid']);
    case wellKnownCredential.HEALTHID:
      return i18next.t(['wallet:credentials.names.hiid']);
    case wellKnownCredential.DISABILITY_CARD:
      return i18next.t(['wallet:credentials.names.disabilityCard']);
    default:
      return i18next.t(['wallet:credentials.names.unknown']);
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
