import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { CredentialType } from './itwMocksUtils';
import { ItwCredentialStatus } from './itwTypesUtils';

// Credentials that can be actively requested and obtained by the user
export const availableCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
] as const;

// New credentials that can be actively requested and obtained by the user
export const newCredentials = [
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY
] as const;

export type NewCredential = (typeof newCredentials)[number];

// Credentials that will be available in the future
export const upcomingCredentials = [] as ReadonlyArray<string>;

export const isUpcomingCredential = (type: string): boolean =>
  upcomingCredentials.includes(type);

export const isNewCredential = (type: string): type is NewCredential =>
  newCredentials.includes(type as NewCredential);

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
    text: I18n.t('features.itWallet.card.status.invalid')
  },
  expired: {
    variant: 'error',
    text: I18n.t('features.itWallet.card.status.expired')
  },
  jwtExpired: {
    variant: 'error',
    text: I18n.t('features.itWallet.card.status.verificationExpired')
  },
  expiring: {
    variant: 'warning',
    text: I18n.t('features.itWallet.card.status.expiring')
  },
  jwtExpiring: {
    variant: 'warning',
    text: I18n.t('features.itWallet.card.status.verificationExpiring')
  },
  unknown: {
    variant: 'custom',
    icon: { name: 'infoFilled', color: 'grey-450' },
    text: I18n.t('features.itWallet.card.status.unknown')
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
