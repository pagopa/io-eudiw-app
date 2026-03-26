import { DefaultResource as WalletDefaultResource } from '@io-eudiw-app/it-wallet';
import global from '../../locales/it/global.json';
import { DefaultResource as CommonDefaultResource } from '@io-eudiw-app/commons';

type GlobalResource = {
  global: typeof global;
};

type DefaultResource = CommonDefaultResource &
  WalletDefaultResource &
  GlobalResource;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'global';
    resources: DefaultResource;
  }
}
