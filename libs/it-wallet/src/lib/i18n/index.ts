import {
  DefaultResource as CommonDefaultResource,
  resource as commonResource
} from '@io-eudiw-app/commons';
import wallet from '../../locales/it/wallet.json';
import { Resource } from 'i18next';
import { merge } from 'lodash';

const walletResource = {
  it: {
    wallet
  }
};

export type DefaultResource = CommonDefaultResource & {
  wallet: typeof wallet;
};

export const resource: Resource = merge({}, commonResource, walletResource);
