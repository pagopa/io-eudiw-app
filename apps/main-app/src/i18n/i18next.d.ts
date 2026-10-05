import { resource as commonResource } from '@io-eudiw-app/commons';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { itWalletHsmFeature } from '@io-eudiw-app/it-wallet-hsm';

import global from '../../locales/it/global.json';

type DefaultResource = typeof commonResource.it &
  typeof itWalletFeature.resource.it &
  typeof itWalletHsmFeature.resource.it & {
    global: typeof global;
  };

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'global';
    resources: DefaultResource;
  }
}
