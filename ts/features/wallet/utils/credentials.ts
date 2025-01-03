import i18next from 'i18next';

export const ISSUER_MOCK_NAME = 'Istituto Poligrafico e Zecca dello Stato';

type CredentialsKeys = 'DRIVING_LICENSE' | 'PID';

export const wellKnownCredential: Record<CredentialsKeys, string> = {
  DRIVING_LICENSE: 'MDL',
  PID: 'PersonIdentificationData'
};

export const getCredentialNameByType = (type: string): string => {
  switch (type) {
    case wellKnownCredential.DRIVING_LICENSE:
      return i18next.t('credentials.names.mdl', {ns: 'wallet'});
    case wellKnownCredential.PID:
      return i18next.t('credentials.names.pid', {ns: 'wallet'});
    default:
      return i18next.t('credentials.names.unknown', {ns: 'wallet'});
  }
};
