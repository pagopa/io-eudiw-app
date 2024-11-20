import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enGlobal from '../../locales/en/global.json';
import itGlobal from '../../locales/it/global.json';
import enOnboarding from '../../locales/en/onboarding.json';
import itOnboarding from '../../locales/it/onboarding.json';

const initI18n = async () =>
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
        onboarding: enOnboarding
      },
      it: {
        global: itGlobal,
        onboarding: itOnboarding
      }
    }
  });

export default initI18n;
