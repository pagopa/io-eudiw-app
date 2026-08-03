import { resource as commonResource } from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import i18n from 'i18next'; // Change this from * as i18n
import { forEach } from 'lodash';
import { initReactI18next } from 'react-i18next';

import global from '../../locales/it/global.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addResources = (resourceMap: Record<string, any>) => {
  forEach(resourceMap, (namespaces, lang) => {
    forEach(namespaces, (bundle, ns) => {
      i18n.addResourceBundle(lang, ns, bundle, true, true);
    });
  });
};

const initI18n = async () => {
  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    defaultNS: 'global',
    fallbackLng: 'it',
    react: {
      useSuspense: true
    },
    resources: {
      it: { global }
    }
  });

  addResources(commonResource);
  addResources(itWalletFeature.resource);

  return i18n;
};

export default initI18n;
