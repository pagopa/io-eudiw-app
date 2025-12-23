/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig, persistReducer } from 'redux-persist';
import { RootState } from '../../../store/types';
import { preferencesReset } from '../../../store/reducers/preferences';

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
export type LifecycleState = Readonly<{
  lifecycle: Lifecycle;
}>;

// Initial state for the lifecycle slice
const initialState: LifecycleState = {
  lifecycle: Lifecycle.LIFECYCLE_OPERATIONAL
};

/**
 * Redux slice for the lifecycle state. It allows to set and reset the pin.
 */
const lifecycleSlice = createSlice({
  name: 'lifecycle',
  initialState,
  reducers: {
    setLifecycle: (state, action: PayloadAction<LifecycleState>) => {
      state.lifecycle = action.payload.lifecycle;
    },
    resetLifecycle: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const lifecyclePersist: PersistConfig<LifecycleState> = {
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
 * Select the current wallet lifecycle.
 * @param state - The root state
 * @returns the current wallet lifecycle
 */
export const selectLifecycle = (state: RootState) =>
  state.wallet.lifecycle.lifecycle;

/**
 * Selects if the wallet lifecycle is valid.
 * @param state - The root state
 * @returns true if the wallet lifecycle is valid, false otherwise
 */
export const lifecycleIsValidSelector = (state: RootState) =>
  state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_VALID;

/**
 * Selects if the wallet lifecycle is operational.
 * @param state - The root state
 * @returns true if the wallet lifecycle is operational, false otherwise
 */
export const lifecycleIsOperationalSelector = (state: RootState) =>
  state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_OPERATIONAL;
