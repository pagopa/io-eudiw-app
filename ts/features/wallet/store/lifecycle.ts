/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';

/**
 * Enum for the lifecycle state of the wallet.
 * LIFECYCLE_VALID - The wallet is valid and has a PID;
 * LIFECYCLE_OPERATIONAL - The wallet is operational and can be used to obtain a PID;
 * LIFECYCLE_DEACTIVATED - The wallet is deactivated (not used).
 */
export enum Lifecycle {
  'LIFECYCLE_VALID',
  'LIFECYCLE_OPERATIONAL',
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
export const lifecycleState = createSlice({
  name: 'lifecycle',
  initialState,
  reducers: {
    setLifecycle: (state, action: PayloadAction<LifecycleState>) => {
      state.lifecycle = action.payload.lifecycle;
    },
    resetLifecycle: () => initialState
  }
});

/**
 * Exports the actions for the lifecycle slice.
 */
export const {setLifecycle} = lifecycleState.actions;

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
