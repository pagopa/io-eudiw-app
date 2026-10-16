import {
  resource as commonResource,
  LocaleResource
} from '@io-eudiw-app/commons';
import { merge } from 'lodash';

import itWalletHsm from '../../locales/it/walletHsm.json';

const walletResource = {
  it: {
    itWalletHsm
  }
} satisfies LocaleResource;

export const resource = merge({}, commonResource, walletResource);
