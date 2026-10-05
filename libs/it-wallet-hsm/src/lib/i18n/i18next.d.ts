import { resource as commonResource } from '@io-eudiw-app/commons';

import itWalletHsm from '../../locales/it/itWalletHsm.json';

export type DefaultResource = typeof commonResource.it & {
  itWalletHsm: typeof itWalletHsm;
};

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: never;
    resources: DefaultResource;
  }
}
