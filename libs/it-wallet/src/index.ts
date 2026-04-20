import { walletRootReducer } from './lib/store';
import type { MiniApp } from '@io-eudiw-app/commons';
import { resource } from './lib/i18n';
import {
  LINKING_SCHEMES,
  MainNavigatorParamsList,
  MainStackNavigator,
  walletLinkingConfig
} from './lib/navigation/main/MainStackNavigator';
import { addWalletListeners } from './lib/middleware/index';

const walletReducer = {
  wallet: walletRootReducer
};

export const itWalletFeature = {
  id: 'it-wallet',
  reducer: walletReducer,
  resource,
  Navigator: MainStackNavigator,
  linkingSchemes: LINKING_SCHEMES,
  linkingConfig: walletLinkingConfig,
  addListeners: addWalletListeners
} satisfies MiniApp<'it-wallet', 'wallet', MainNavigatorParamsList>;

export type ItWalletMiniAppId = typeof itWalletFeature.id;
