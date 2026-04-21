import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { WalletCombinedRootState } from '.';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';

/* State type definition for the instance slice
 * keyTag - The keytag bound to the wallet instance
 */
type InstanceSlice = {
  keyTag: string | undefined;
};

// Initial state for the instance slice
const initialState: InstanceSlice = {
  keyTag: undefined
};

/**
 * Redux slice for the instance state. It allows to store and reset the keytag bound to the wallet instance.
 */
const instanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {
    setInstanceKeyTag: (state, action: PayloadAction<string>) => {
      state.keyTag = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const instancePersist: PersistConfig<InstanceSlice> = {
  key: 'attestation',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the instance slice.
 */
export const instanceReducer = persistReducer(
  instancePersist,
  instanceSlice.reducer
);

/**
 * Exports the actions for the instance slice.
 */
export const { setInstanceKeyTag } = instanceSlice.actions;

/**
 * Select the wallet instance keytag.
 * @param state - The root state
 * @returns the wallet instance keytag
 */
export const selectInstanceKeyTag = (state: WalletCombinedRootState) =>
  state.wallet.instance.keyTag;
