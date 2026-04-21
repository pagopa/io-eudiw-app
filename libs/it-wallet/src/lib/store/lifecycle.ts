import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { WalletCombinedRootState } from '.';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';

/**
 * Enum for the lifecycle state of the wallet.
 * LIFECYCLE_VALID - The wallet is valid and has a PID;
 * LIFECYCLE_OPERATIONAL - The wallet is operational and can be used to obtain a PID;
 * LIFECYCLE_DEACTIVATED - The wallet is deactivated (not used).
 */
export enum Lifecycle {
  'LIFECYCLE_OPERATIONAL',
  'LIFECYCLE_VALID',
  'LIFECYCLE_DEACTIVATED'
}

/* State type definition for the lifecycle slice
 * lifecycle - Lifecycle state of the wallet
 */
type LifecycleSlice = Readonly<{
  lifecycle: Lifecycle;
}>;

// Initial state for the lifecycle slice
const initialState: LifecycleSlice = {
  lifecycle: Lifecycle.LIFECYCLE_OPERATIONAL
};

/**
 * Redux slice for the lifecycle state.
 */
const lifecycleSlice = createSlice({
  name: 'lifecycle',
  initialState,
  reducers: {
    setLifecycle: (state, action: PayloadAction<LifecycleSlice>) => {
      state.lifecycle = action.payload.lifecycle;
    },
    resetLifecycle: () => initialState
  },
  extraReducers: builder => {
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const lifecyclePersist: PersistConfig<LifecycleSlice> = {
  key: 'lifecycle',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the instance slice.
 */
export const lifecycleReducer = persistReducer(
  lifecyclePersist,
  lifecycleSlice.reducer
);

/**
 * Exports the actions for the lifecycle slice.
 */
export const { setLifecycle, resetLifecycle } = lifecycleSlice.actions;

/**
 * Selects if the wallet lifecycle is valid.
 * @param state - The root state
 * @returns true if the wallet lifecycle is valid, false otherwise
 */
export const lifecycleIsValidSelector = (state: WalletCombinedRootState) =>
  state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_VALID;

/**
 * Selects if the wallet lifecycle is operational.
 * @param state - The root state
 * @returns true if the wallet lifecycle is operational, false otherwise
 */
export const lifecycleIsOperationalSelector = (
  state: WalletCombinedRootState
) => state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_OPERATIONAL;
