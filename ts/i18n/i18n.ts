import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enMain from '../../locales/en/main.json';
import itMain from '../../locales/it/main.json';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3', // We don't need pluralization
  fallbackLng: 'en',
  defaultNS: 'ns1',
  resources: {
    en: {
      main: enMain
    },
    it: {
      ns1: itMain
    }
  }
});

export default i18next;
