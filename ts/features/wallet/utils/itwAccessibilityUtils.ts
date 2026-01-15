import I18n from 'i18next';
import { ItwCredentialStatus } from './itwTypesUtils';

export const accessibilityLabelByStatus: {
  [key in ItwCredentialStatus]?: string;
} = {
  invalid: I18n.t('credentials.status.invalid', { ns: 'wallet' }),
  expired: I18n.t('credentials.status.expired', { ns: 'wallet' }),
  jwtExpired: I18n.t('credentials.status.verificationExpired', {
    ns: 'wallet'
  }),
  expiring: I18n.t('credentials.status.expiring', { ns: 'wallet' }),
  jwtExpiring: I18n.t('credentials.status.verificationExpiring', {
    ns: 'wallet'
  })
};
