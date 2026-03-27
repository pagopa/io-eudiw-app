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

// export type WalletRootState = {
//   wallet: ReturnType<typeof walletRootReducer>;
// };

// 3. Use 'satisfies' with the exact slice name and route params
export const itWalletFeature = {
  reducer: walletReducer,
  resource,
  Navigator: MainStackNavigator,
  linkingSchemes: LINKING_SCHEMES,
  linkingConfig: walletLinkingConfig,
  addListeners: addWalletListeners
} satisfies MiniApp<'wallet', MainNavigatorParamsList>;
