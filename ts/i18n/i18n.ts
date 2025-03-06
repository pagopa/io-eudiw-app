import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enGlobal from '../../locales/en/global.json';
import itGlobal from '../../locales/it/global.json';
import enOnboarding from '../../locales/en/onboarding.json';
import itOnboarding from '../../locales/it/onboarding.json';
import enWallet from '../../locales/en/wallet.json';
import enQrCodeScan from '../../locales/en/qrcodeScan.json';
import {recordStartupDebugInfo} from '../store/utils/debug';

const initI18n = async () => {
  /*
   * Debug info to check i18next setup ends correctly
   */
  recordStartupDebugInfo({i18nInitialized: false});
  await i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3', // We don't need pluralization
    fallbackLng: 'en',
    defaultNS: 'global',
    react: {
      useSuspense: true
    },
    resources: {
      en: {
        global: enGlobal,
        onboarding: enOnboarding,
        wallet: enWallet,
        qrcodeScan: enQrCodeScan
      },
      it: {
        global: itGlobal,
        onboarding: itOnboarding
      }
    }
  });
  recordStartupDebugInfo({i18nInitialized: true});
};

export default initI18n;
