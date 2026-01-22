import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { CredentialType } from './itwMocksUtils';
import { ItwCredentialStatus } from './itwTypesUtils';
import { wellKnownCredential } from './credentials';

// New credentials that can be actively requested and obtained by the user
export const newCredentials = [
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY
] as const;

export type NewCredential = (typeof newCredentials)[number];

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
    text: I18n.t('credentials.status.invalid', { ns: 'wallet' })
  },
  expired: {
    variant: 'error',
    text: I18n.t('credentials.status.expired', { ns: 'wallet' })
  },
  jwtExpired: {
    variant: 'error',
    text: I18n.t('credentials.status.verificationExpired', { ns: 'wallet' })
  },
  expiring: {
    variant: 'warning',
    text: I18n.t('credentials.status.expiring', { ns: 'wallet' })
  },
  jwtExpiring: {
    variant: 'warning',
    text: I18n.t('credentials.status.verificationExpiring', { ns: 'wallet' })
  },
  unknown: {
    variant: 'custom',
    icon: { name: 'infoFilled', color: 'grey-450' },
    text: I18n.t('credentials.status.unknown', { ns: 'wallet' })
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

export const itwGetCredentialNameByCredentialType = (): Record<
  string,
  string
> => ({
  [wellKnownCredential.DISABILITY_CARD]: I18n.t(
    'credentials.names.disabilityCard',
    {
      ns: 'wallet'
    }
  ),
  [wellKnownCredential.DRIVING_LICENSE]: I18n.t('credentials.names.mdl', {
    ns: 'wallet'
  }),
  [wellKnownCredential.PID]: I18n.t('credentials.names.pid', {
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
