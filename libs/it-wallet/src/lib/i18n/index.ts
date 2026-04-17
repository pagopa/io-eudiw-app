import {
  resource as commonResource,
  LocaleResource
} from '@io-eudiw-app/commons';
import wallet from '../../locales/it/wallet.json';
import { merge } from 'lodash';

const walletResource = {
  it: {
    wallet
  }
} satisfies LocaleResource;

export const resource = merge({}, commonResource, walletResource);
