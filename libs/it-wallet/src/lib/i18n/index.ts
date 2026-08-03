import {
  resource as commonResource,
  LocaleResource
} from '@io-eudiw-app/commons';
import { merge } from 'lodash';

import wallet from '../../locales/it/wallet.json';

const walletResource = {
  it: {
    wallet
  }
} satisfies LocaleResource;

export const resource = merge({}, commonResource, walletResource);
