import i18next from 'i18next';

type CredentialsKeys = 'DRIVING_LICENSE' | 'PID' | 'HEALTHID';

export const wellKnownCredential: Record<CredentialsKeys, string> = {
  DRIVING_LICENSE: 'org.iso.18013.5.1.mDL',
  PID: 'urn:eu.europa.ec.eudi:pid:1',
  HEALTHID: 'eu.europa.ec.eudi.hiid.1'
};

export const getCredentialNameByType = (type?: string): string => {
  switch (type) {
    case wellKnownCredential.DRIVING_LICENSE:
      return i18next.t(['wallet:credentials.names.mdl']);
    case wellKnownCredential.PID:
      return i18next.t(['wallet:credentials.names.pid']);
    case wellKnownCredential.HEALTHID:
      return i18next.t(['wallet:credentials.names.hiid']);
    default:
      return i18next.t(['wallet:credentials.names.unknown']);
  }
};
