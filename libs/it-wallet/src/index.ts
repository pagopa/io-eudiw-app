import type { MiniApp } from '@io-eudiw-app/commons';

import { resource } from './lib/i18n';
import { addWalletListeners } from './lib/middleware/index';
import { LINKING_SCHEMES } from './lib/navigation/main/deepLinkSchemas';
import {
  MainNavigatorParamsList,
  MainStackNavigator,
  walletLinkingConfig
} from './lib/navigation/main/MainStackNavigator';
import { walletRootReducer } from './lib/store';

const walletReducer = {
  wallet: walletRootReducer
};

export const itWalletFeature = {
  addListeners: addWalletListeners,
  id: 'it-wallet',
  linkingConfig: walletLinkingConfig,
  linkingSchemes: LINKING_SCHEMES,
  Navigator: MainStackNavigator,
  reducer: walletReducer,
  resource
} satisfies MiniApp<'it-wallet', 'wallet', MainNavigatorParamsList>;
