import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import { t } from 'i18next';

import { ItwIridescentBorderVariant } from '../components/ItwBrandedSkiaBorder';
import { wellKnownCredential } from './credentials';
import { ItwCredentialStatus } from './itwTypesUtils';

export const useBorderColorByStatus = (
  credentialType?: string
): Record<ItwCredentialStatus, string> => {
  const theme = useIOTheme();

  if (credentialType === wellKnownCredential.BONUS_PARI) {
    const transparent = 'transparent';
    return {
      expired: transparent,
      expiring: transparent,
      invalid: transparent,
      jwtExpired: transparent,
      jwtExpiring: transparent,
      unknown: transparent,
      valid: transparent
    };
  }

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
    text: t('credentials.status.expired', { ns: 'aptitude' }),
    variant: 'error'
  },
  expiring: {
    text: t('credentials.status.expiring', { ns: 'aptitude' }),
    variant: 'warning'
  },
  invalid: {
    text: t('credentials.status.invalid', { ns: 'aptitude' }),
    variant: 'error'
  },
  jwtExpired: {
    text: t('credentials.status.verificationExpired', { ns: 'aptitude' }),
    variant: 'error'
  },
  jwtExpiring: {
    text: t('credentials.status.verificationExpiring', { ns: 'aptitude' }),
    variant: 'warning'
  },
  unknown: {
    icon: { color: 'grey-450', name: 'infoFilled' },
    text: t('credentials.status.unknown', { ns: 'aptitude' }),
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

const itwGetCredentialNameByCredentialType = (): Record<string, string> => ({
  [wellKnownCredential.BONUS_PARI]: t('credentials.names.bonusPari', {
    ns: 'aptitude'
  }),
  [wellKnownCredential.DISABILITY_CARD]: t('credentials.names.disabilityCard', {
    ns: 'aptitude'
  }),
  [wellKnownCredential.DRIVING_LICENSE]: t('credentials.names.mdl', {
    ns: 'aptitude'
  }),
  [wellKnownCredential.PID]: t('credentials.names.pid', {
    ns: 'aptitude'
  })
});

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault = ''
): string =>
  credentialType !== undefined
    ? itwGetCredentialNameByCredentialType()[credentialType]
    : withDefault;

export const borderVariantByStatus: Record<
  ItwCredentialStatus,
  ItwIridescentBorderVariant
> = {
  expired: 'error',
  expiring: 'warning',
  invalid: 'error',
  jwtExpired: 'error',
  jwtExpiring: 'warning',
  unknown: 'default',
  valid: 'default'
};

export const useTagPropsByStatus = (): Partial<
  Record<ItwCredentialStatus, Tag>
> => ({
  expired: {
    text: t('aptitude', 'credentials.status.expired'),
    variant: 'error'
  },
  expiring: {
    text: t('aptitude', 'credentials.status.expiring'),
    variant: 'warning'
  },
  invalid: {
    text: t('aptitude', 'credentials.status.invalid'),
    variant: 'error'
  },
  jwtExpired: {
    text: t('aptitude', 'credentials.status.verificationExpired'),
    variant: 'error'
  },
  jwtExpiring: {
    text: t('aptitude', 'credentials.status.verificationExpiring'),
    variant: 'warning'
  },
  unknown: {
    icon: { color: 'grey-450', name: 'infoFilled' },
    text: t('aptitude', 'credentials.status.unknown'),
    variant: 'custom'
  }
});
