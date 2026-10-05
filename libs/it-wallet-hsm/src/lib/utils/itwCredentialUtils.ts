import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import { t } from 'i18next';

import { ItwCredentialStatus } from './itwTypesUtils';

export const useBorderColorByStatus = (): Record<
  ItwCredentialStatus,
  string
> => {
  const theme = useIOTheme();

  return {
    expired: IOColors['error-600'],
    expiring: IOColors['warning-700'],
    invalid: IOColors['error-600'],
    jwtExpired: IOColors['error-600'],
    jwtExpiring: IOColors['warning-700'],
    unknown: IOColors['grey-300'],
    valid: IOColors[theme['appBackground-primary']]
  };
};

export const tagPropsByStatus: Partial<Record<ItwCredentialStatus, Tag>> = {
  expired: {
    text: t('credentials.status.expired', { ns: 'itWalletHsm' }),
    variant: 'error'
  },
  expiring: {
    text: t('credentials.status.expiring', { ns: 'itWalletHsm' }),
    variant: 'warning'
  },
  invalid: {
    text: t('credentials.status.invalid', { ns: 'itWalletHsm' }),
    variant: 'error'
  },
  jwtExpired: {
    text: t('credentials.status.verificationExpired', { ns: 'itWalletHsm' }),
    variant: 'error'
  },
  jwtExpiring: {
    text: t('credentials.status.verificationExpiring', { ns: 'itWalletHsm' }),
    variant: 'warning'
  },
  unknown: {
    icon: { color: 'grey-450', name: 'infoFilled' },
    text: t('credentials.status.unknown', { ns: 'itWalletHsm' }),
    variant: 'custom'
  }
};

/**
 * List of statuses that make a credential valid, especially for UI purposes.
 */
export const validCredentialStatuses: ItwCredentialStatus[] = [
  'valid',
  'expiring',
  'jwtExpiring'
];

/**
 * Returns a generic, blank display name for a credential: its raw credential
 * type/vct identifier, with no per-credential hard-coded label.
 */
export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault = ''
): string => credentialType ?? withDefault;

export const useTagPropsByStatus = (): Partial<
  Record<ItwCredentialStatus, Tag>
> => ({
  expired: {
    text: t('itWalletHsm', 'credentials.status.expired'),
    variant: 'error'
  },
  expiring: {
    text: t('itWalletHsm', 'credentials.status.expiring'),
    variant: 'warning'
  },
  invalid: {
    text: t('itWalletHsm', 'credentials.status.invalid'),
    variant: 'error'
  },
  jwtExpired: {
    text: t('itWalletHsm', 'credentials.status.verificationExpired'),
    variant: 'error'
  },
  jwtExpiring: {
    text: t('itWalletHsm', 'credentials.status.verificationExpiring'),
    variant: 'warning'
  },
  unknown: {
    icon: { color: 'grey-450', name: 'infoFilled' },
    text: t('itWalletHsm', 'credentials.status.unknown'),
    variant: 'custom'
  }
});
