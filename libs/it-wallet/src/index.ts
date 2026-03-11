import { Reducer } from '@reduxjs/toolkit';
import { walletReducer, WalletState } from './lib/store';




// 2. Explicitly type the exported object so TypeScript stops inferring deeply
export const reducer: { wallet: Reducer<WalletState> } = {
  wallet: walletReducer
};