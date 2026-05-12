import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import global from '../../locales/it/global.json';
import { resource as commonResource } from '@io-eudiw-app/commons';

type DefaultResource = typeof commonResource.it &
  typeof itWalletFeature.resource.it & {
    global: typeof global;
  };

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'global';
    resources: DefaultResource;
  }
}
