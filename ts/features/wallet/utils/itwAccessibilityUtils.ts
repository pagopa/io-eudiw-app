import { t } from 'i18next';
import { ItwJwtCredentialStatus } from './itwTypesUtils';

// Combined status of a credential, that includes both the physical and the digital version
type ItwCredentialStatus =
  | 'unknown'
  | 'valid'
  | 'invalid'
  | 'expiring'
  | 'expired'
  | ItwJwtCredentialStatus;

export const accessibilityLabelByStatus: {
  [key in ItwCredentialStatus]?: string;
} = {
  invalid: t('credentials.status.invalid', {
    ns: 'wallet'
  }),
  expired: t('credentials.status.expired', {
    ns: 'wallet'
  }),
  jwtExpired: t('credentials.status.verificationExpired', {
    ns: 'wallet'
  }),
  expiring: t('credentials.status.expiring', {
    ns: 'wallet'
  }),
  jwtExpiring: t('credentials.status.verificationExpiring', {
    ns: 'wallet'
  })
};
