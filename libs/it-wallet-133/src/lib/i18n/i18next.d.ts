import { resource as commonResource } from '@io-eudiw-app/commons';
import wallet from '../../locales/it/wallet.json';

export type DefaultResource = typeof commonResource.it & {
  wallet: typeof wallet;
};

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: DefaultResource;
    defaultNS: never;
  }
}
