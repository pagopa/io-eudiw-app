import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import itGlobal from '../../locales/it/global.json';
import itOnboarding from '../../locales/it/onboarding.json';
import itWallet from '../../locales/it/wallet.json';
import itQrCodeScan from '../../locales/it/qrcodeScan.json';

const initI18n = async () =>
  await i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3', // We don't need pluralization
    fallbackLng: 'it',
    defaultNS: 'global',
    react: {
      useSuspense: true
    },
    resources: {
      it: {
        global: itGlobal,
        onboarding: itOnboarding,
        wallet: itWallet,
        qrcodeScan: itQrCodeScan
      }
    }
  });

export default initI18n;
