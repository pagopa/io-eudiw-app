import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { wellKnownCredential } from './credentials';
import { ItwCredentialStatus } from './itwTypesUtils';

export const useBorderColorByStatus: () => {
  [key in ItwCredentialStatus]: string;
} = () => {
  const theme = useIOTheme();

  return {
    valid: IOColors[theme['appBackground-primary']],
    invalid: IOColors['error-600'],
    expired: IOColors['error-600'],
    expiring: IOColors['warning-700'],
    jwtExpired: IOColors['error-600'],
    jwtExpiring: IOColors['warning-700'],
    unknown: IOColors['grey-300']
  };
};

export const tagPropsByStatus: { [key in ItwCredentialStatus]?: Tag } = {
  invalid: {
    variant: 'error',
    text: t('credentials.status.invalid', { ns: 'wallet' })
  },
  expired: {
    variant: 'error',
    text: t('credentials.status.expired', { ns: 'wallet' })
  },
  jwtExpired: {
    variant: 'error',
    text: t('credentials.status.verificationExpired', { ns: 'wallet' })
  },
  expiring: {
    variant: 'warning',
    text: t('credentials.status.expiring', { ns: 'wallet' })
  },
  jwtExpiring: {
    variant: 'warning',
    text: t('credentials.status.verificationExpiring', { ns: 'wallet' })
  },
  unknown: {
    variant: 'custom',
    icon: { name: 'infoFilled', color: 'grey-450' },
    text: t('credentials.status.unknown', { ns: 'wallet' })
  }
};

/**
 * List of statuses that make a credential valid, especially for UI purposes.
 */
export const validCredentialStatuses: Array<ItwCredentialStatus> = [
  'valid',
  'expiring',
  'jwtExpiring'
];

const itwGetCredentialNameByCredentialType = (): Record<string, string> => ({
  [wellKnownCredential.DISABILITY_CARD]: t('credentials.names.disabilityCard', {
    ns: 'wallet'
  }),
  [wellKnownCredential.DRIVING_LICENSE]: t('credentials.names.mdl', {
    ns: 'wallet'
  }),
  [wellKnownCredential.PID]: t('credentials.names.pid', {
    ns: 'wallet'
  })
});

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = ''
): string =>
  credentialType !== undefined
    ? itwGetCredentialNameByCredentialType()[credentialType]
    : withDefault;
