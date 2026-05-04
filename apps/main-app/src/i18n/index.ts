import i18n from 'i18next'; // Change this from * as i18n
import { initReactI18next } from 'react-i18next';
import global from '../../locales/it/global.json';
import { resource as commonResource } from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { forEach } from 'lodash';
import { itWalletFeature133 } from '@io-eudiw-app/it-wallet-133';

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
  addResources(itWalletFeature.resource);
  addResources(itWalletFeature133.resource);

  return i18n;
};

export default initI18n;
