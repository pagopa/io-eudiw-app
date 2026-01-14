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
  invalid: I18n.t('features.itWallet.card.status.invalid'),
  expired: I18n.t('features.itWallet.card.status.expired'),
  jwtExpired: I18n.t('features.itWallet.card.status.verificationExpired'),
  expiring: I18n.t('features.itWallet.card.status.expiring'),
  jwtExpiring: I18n.t('features.itWallet.card.status.verificationExpiring')
};
