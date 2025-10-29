import i18next from 'i18next';

export type CredentialsKeys =
  | 'DRIVING_LICENSE'
  | 'PID'
  | 'HEALTHID'
  | 'FBK_BADGE'
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
  FBK_BADGE: 'eu.europa.it.badge',
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
  FBK_BADGE: 'mso_mdoc_CompanyBadge',
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
    case wellKnownCredential.FBK_BADGE:
      return i18next.t(['wallet:credentials.names.fbk']);
    case wellKnownCredential.DISABILITY_CARD:
      return i18next.t(['wallet:credentials.names.disabilityCard']);
    default:
      return i18next.t(['wallet:credentials.names.unknown']);
  }
};
