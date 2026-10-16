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
