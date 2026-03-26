import i18n from 'i18next'; // Change this from * as i18n
import { initReactI18next } from 'react-i18next';
import global from '../../locales/it/global.json';
import { resource as commonResource } from '@io-eudiw-app/commons';
import { resource as itWalletResource } from '@io-eudiw-app/it-wallet';

const addResources = (resourceMap: Record<string, unknown>) => {
  Object.entries(resourceMap).forEach(([lang, namespaces]) => {
    if (typeof namespaces === 'object' && namespaces !== null) {
      Object.entries(namespaces).forEach(([ns, bundle]) => {
        i18n.addResourceBundle(lang, ns, bundle, true, true);
      });
    }
  });
};

const initI18n = async () => {
  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    fallbackLng: 'it',
    defaultNS: 'global',
    react: {
      useSuspense: true
    },
    resources: {
      it: { global }
    }
  });

  addResources(commonResource);
  addResources(itWalletResource);

  return i18n;
};

export default initI18n;
