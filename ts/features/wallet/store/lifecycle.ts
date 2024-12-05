/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';

export enum Lifecycle {
  'LIFECYCLE_VALID',
  'LIFECYCLE_OPERATIONAL',
  'LIFECYCLE_DEACTIVATED'
}

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type LifecycleState = Readonly<{
  lifecycle: Lifecycle;
}>;

// Initial state for the pin slice
const initialState: LifecycleState = {
  lifecycle: Lifecycle.LIFECYCLE_OPERATIONAL
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
const lifecycleSlice = createSlice({
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
 * Exports the actions for the pin slice.
 */
export const {setLifecycle} = lifecycleSlice.actions;

export const {reducer: lifecycleReducer} = lifecycleSlice;

export const selectLifecycle = (state: RootState) =>
  state.wallet.lifecycle.lifecycle;

export const lifecycleIsValidSelector = (state: RootState) =>
  state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_VALID;

export const lifecycleIsOperationalSelector = (state: RootState) =>
  state.wallet.lifecycle.lifecycle === Lifecycle.LIFECYCLE_OPERATIONAL;
