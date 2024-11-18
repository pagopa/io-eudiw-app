import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enNs1 from '../../locales/en/ns1.json';
import itNs1 from '../../locales/it/ns1.json';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3', // We don't need pluralization
  fallbackLng: 'en',
  defaultNS: 'ns1',
  resources: {
    en: {
      ns1: enNs1
    },
    it: {
      ns1: itNs1
    }
  }
});

export default i18next;
