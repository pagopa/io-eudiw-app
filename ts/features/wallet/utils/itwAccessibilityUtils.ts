import I18n from 'i18next';
import { ItwJwtCredentialStatus } from './itwTypesUtils';

// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | 'unknown'
  | 'valid'
  | 'invalid'
  | 'expiring'
  | 'expired'
  | ItwJwtCredentialStatus;

export const accessibilityLabelByStatus: {
  [key in ItwCredentialStatus]?: string;
} = {
  invalid: I18n.t('credentials.status.invalid', {
    ns: 'wallet'
  }),
  expired: I18n.t('credentials.status.expired', {
    ns: 'wallet'
  }),
  jwtExpired: I18n.t('credentials.status.verificationExpired', {
    ns: 'wallet'
  }),
  expiring: I18n.t('credentials.status.expiring', {
    ns: 'wallet'
  }),
  jwtExpiring: I18n.t('credentials.status.verificationExpiring', {
    ns: 'wallet'
  })
};
