import type { ParseKeys } from 'i18next';
import I18n from 'i18next';
import { wellKnownCredential } from './credentials';
import { IOToast, type ListItemAction } from '@pagopa/io-app-design-system';
import { openWebUrl } from '@io-eudiw-app/commons';
import { useAppSelector } from '../store';
import { selectCredential } from '../store/credentials';
import { WellKnownClaim } from './itwClaimsUtils';
import z from 'zod';

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
  showAnimatedBorder: boolean;
  flippable: boolean;
  suppressStatusAlert: boolean;
  infoAlert?: CredentialInfoAlert;
  invalidStatusFailure?: CredentialInvalidStatusFailure;
  getExtraCredentialActions?: (
    appSelectorHook: typeof useAppSelector
  ) => { key: string; props: ListItemAction }[];
};

const DEFAULT_CAPABILITIES: ItwCredentialCapabilities = {
  showStatusTag: true,
  showAnimatedBorder: true,
  flippable: true,
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
    showAnimatedBorder: false,
    flippable: false,
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
    },
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
            testID: 'PARI_BONUS_CTA_1_TESTID',
            variant: 'primary',
            icon: 'history',
            label: I18n.t(
              'presentation.credentialDetails.actions.pariPurchases',
              { ns: 'wallet' }
            ),
            accessibilityLabel: I18n.t(
              'presentation.credentialDetails.actions.pariPurchases',
              { ns: 'wallet' }
            ),
            onPress: () => {
              fiscalCode.success
                ? openWebUrl(
                    `https://dev.bonuselettrodomestici.it/utente/it-wallet/payment/${fiscalCode.data}`,
                    () =>
                      IOToast.error(I18n.t('errors.generic', { ns: 'common' }))
                  )
                : IOToast.error(I18n.t('errors.generic', { ns: 'common' }));
            }
          }
        }
      ];
    }
  }
};

export const getCredentialCapabilities = (
  credentialType: string
): ItwCredentialCapabilities =>
  itwCredentialCapabilities[credentialType] ?? DEFAULT_CAPABILITIES;
