import { walletRootReducer } from './lib/store';
export * from './lib/navigation/main/MainStackNavigator';
export {addWalletListeners} from './lib/middleware/index';


// 2. Explicitly type the exported object so TypeScript stops inferring deeply
export const walletReducer = {
  wallet: walletRootReducer
};

export type WalletRootState = {
  wallet: ReturnType<typeof walletRootReducer>;
};