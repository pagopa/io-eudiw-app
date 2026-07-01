import type { ParseKeys } from 'i18next';
import { wellKnownCredential } from './credentials';

export type CredentialInfoAlert = {
  testID: string;
  contentI18nKey: ParseKeys<'wallet'>;
};

type CredentialInvalidStatusFailure = {
  pictogram: 'accessDenied';
  titleI18nKey: ParseKeys<['common', 'wallet']>;
  subtitleI18nKey: ParseKeys<['common', 'wallet']>;
  actionI18nKey: ParseKeys<['common', 'wallet']>;
  actionUrl: string;
};

export type ItwCredentialCapabilities = {
  showStatusTag: boolean;
  suppressStatusAlert: boolean;
  infoAlert?: CredentialInfoAlert;
  invalidStatusFailure?: CredentialInvalidStatusFailure;
};

const DEFAULT_CAPABILITIES: ItwCredentialCapabilities = {
  showStatusTag: true,
  suppressStatusAlert: false
};

const itwCredentialCapabilities: Record<string, ItwCredentialCapabilities> = {
  [wellKnownCredential.DRIVING_LICENSE]: {
    ...DEFAULT_CAPABILITIES,
    infoAlert: {
      testID: 'itwMdlBannerTestID',
      contentI18nKey: 'presentation.alerts.mdl.content'
    }
  },
  [wellKnownCredential.DISABILITY_CARD]: {
    ...DEFAULT_CAPABILITIES,
    infoAlert: {
      testID: 'itwEdcBannerTestID',
      contentI18nKey: 'presentation.alerts.edc.content'
    }
  },
  [wellKnownCredential.BONUS_PARI]: {
    showStatusTag: false,
    suppressStatusAlert: true,
    infoAlert: {
      testID: 'itwBonusPariBannerTestID',
      contentI18nKey: 'presentation.alerts.bonusPari.content'
    },
    invalidStatusFailure: {
      pictogram: 'accessDenied',
      titleI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.title',
      subtitleI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.subtitle',
      actionI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.action',
      actionUrl: 'https://dev.bonuselettrodomestici.it/utente'
    }
  }
};

export const getCredentialCapabilities = (
  credentialType: string
): ItwCredentialCapabilities =>
  itwCredentialCapabilities[credentialType] ?? DEFAULT_CAPABILITIES;
