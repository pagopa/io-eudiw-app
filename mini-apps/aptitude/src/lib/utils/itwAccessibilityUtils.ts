import { t } from 'i18next';

import { ItwJwtCredentialStatus } from './itwTypesUtils';

// Combined status of a credential, that includes both the physical and the digital version
type ItwCredentialStatus =
  | 'expired'
  | 'expiring'
  | 'invalid'
  | 'unknown'
  | 'valid'
  | ItwJwtCredentialStatus;

export const accessibilityLabelByStatus: Partial<
  Record<ItwCredentialStatus, string>
> = {
  expired: t('credentials.status.expired', { ns: 'aptitude' }),
  expiring: t('credentials.status.expiring', { ns: 'aptitude' }),
  invalid: t('credentials.status.invalid', { ns: 'aptitude' }),
  jwtExpired: t('credentials.status.verificationExpired', { ns: 'aptitude' }),
  jwtExpiring: t('credentials.status.verificationExpiring', { ns: 'aptitude' })
};
