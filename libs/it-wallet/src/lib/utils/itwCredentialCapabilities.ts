import type { ParseKeys } from 'i18next';

import { openWebUrlInApp } from '@io-eudiw-app/commons';
import { IOToast, type ListItemAction } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import z from 'zod';

import { useAppSelector } from '../store';
import { selectCredential } from '../store/credentials';
import { wellKnownCredential } from './credentials';
import { WellKnownClaim } from './itwClaimsUtils';

export type CredentialInfoAlert = {
  contentI18nKey: ParseKeys<'wallet'>;
  testID: string;
};

export type ItwCredentialCapabilities = {
  getExtraCredentialActions?: (
    appSelectorHook: typeof useAppSelector
  ) => { key: string; props: ListItemAction }[];
  infoAlert?: CredentialInfoAlert;
  invalidStatusFailure?: CredentialInvalidStatusFailure;
  showStatusTag: boolean;
  suppressStatusAlert: boolean;
};

type CredentialInvalidStatusFailure = {
  actionI18nKey: ParseKeys<['common', 'wallet']>;
  actionUrl: string;
  pictogram: 'accessDenied';
  subtitleI18nKey: ParseKeys<['common', 'wallet']>;
  titleI18nKey: ParseKeys<['common', 'wallet']>;
};

const DEFAULT_CAPABILITIES: ItwCredentialCapabilities = {
  showStatusTag: true,
  suppressStatusAlert: false
};

const itwCredentialCapabilities: Record<string, ItwCredentialCapabilities> = {
  [wellKnownCredential.BONUS_PARI]: {
    getExtraCredentialActions: appSelectorHook => {
      const credential = appSelectorHook(
        selectCredential(wellKnownCredential.BONUS_PARI)
      );

      const fiscalCode = z
        .string()
        .safeParse(
          credential?.parsedCredential[WellKnownClaim.fiscal_code]?.value
        );

      return [
        {
          key: 'PARI_BONUS_CTA_1',
          props: {
            accessibilityLabel: I18n.t(
              'presentation.credentialDetails.actions.pariPurchases',
              { ns: 'wallet' }
            ),
            icon: 'history',
            label: I18n.t(
              'presentation.credentialDetails.actions.pariPurchases',
              { ns: 'wallet' }
            ),
            onPress: () => {
              if (fiscalCode.success) {
                openWebUrlInApp(
                  `https://dev.bonuselettrodomestici.it/utente/it-wallet/payment/${fiscalCode.data}`,
                  () =>
                    IOToast.error(I18n.t('errors.generic', { ns: 'common' }))
                );
              } else {
                IOToast.error(I18n.t('errors.generic', { ns: 'common' }));
              }
            },
            testID: 'PARI_BONUS_CTA_1_TESTID',
            variant: 'primary'
          }
        }
      ];
    },
    infoAlert: {
      contentI18nKey: 'presentation.alerts.bonusPari.content',
      testID: 'itwBonusPariBannerTestID'
    },
    invalidStatusFailure: {
      actionI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.action',
      actionUrl: 'https://dev.bonuselettrodomestici.it/utente',
      pictogram: 'accessDenied',
      subtitleI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.subtitle',
      titleI18nKey:
        'wallet:credentialIssuance.failure.bonusPariNotRequested.title'
    },
    showStatusTag: false,
    suppressStatusAlert: true
  },
  [wellKnownCredential.DISABILITY_CARD]: {
    ...DEFAULT_CAPABILITIES,
    infoAlert: {
      contentI18nKey: 'presentation.alerts.edc.content',
      testID: 'itwEdcBannerTestID'
    }
  },
  [wellKnownCredential.DRIVING_LICENSE]: {
    ...DEFAULT_CAPABILITIES,
    infoAlert: {
      contentI18nKey: 'presentation.alerts.mdl.content',
      testID: 'itwMdlBannerTestID'
    }
  }
};

export const getCredentialCapabilities = (
  credentialType: string
): ItwCredentialCapabilities =>
  itwCredentialCapabilities[credentialType] ?? DEFAULT_CAPABILITIES;
