import i18next from 'i18next';

type CredentialsKeys = 'DRIVING_LICENSE' | 'PID';

export const wellKnownCredential: Record<CredentialsKeys, string> = {
  DRIVING_LICENSE: 'MDL',
  PID: 'PersonIdentificationData'
};

export const getCredentialNameByType = (type: string): string => {
  switch (type) {
    case wellKnownCredential.DRIVING_LICENSE:
      return i18next.t(['wallet:credentials.names.mdl', 'Credential']);
    case wellKnownCredential.PID:
      return i18next.t(['wallet:credentials.names.pid', 'Credential']);
    default:
      return i18next.t(['wallet:credentials.names.unknown', 'Credential']);
  }
};
