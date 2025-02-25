/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setError} from '../../../store/utils/asyncStatus';
import {RootState} from '../../../store/types';

/* State type definition for the proximity slice
 * qrCode - The qr code to be displayed for starting the proximity process
 * error - Cotains the error object if any error occurs during the proximity process
 * state - The state of the proximity process
 */
export type ProximityState = {
  error: unknown;
  state: string;
};

// Initial state for the proximity slice
const initialState: ProximityState = {
  state: '',
  error: undefined
};

/**
 * Redux slice for the proximity state. It holds the status of flows related to the proximity process.
 */
export const proximitySlice = createSlice({
  name: 'proximitySlice',
  initialState,
  reducers: {
    setProximityError: (state, action: PayloadAction<{error: unknown}>) => {
      state.error = setError(action.payload.error);
    },
    setProximityState: (state, action: PayloadAction<string>) => {
      state.state = action.payload;
    },
    resetProximity: () => initialState
  }
});

/**
 * Exports the actions for the proximity slice.
 */
export const {setProximityError, setProximityState, resetProximity} =
  proximitySlice.actions;

/**
 * Exports the reducer for the proximity slice.
 */
export const {reducer: proximityReducer} = proximitySlice;

/**
 * Selects the proximity error from the state.
 * @param state - The root state
 * @returns The error object if it exists, undefined otherwise.
 */
export const selectProximityError = (state: RootState) =>
  state.wallet.proximity.error;

/**
 * Selects the proximity state from the state.
 * @param state - The root state
 * @returns The state of the proximity process.
 */
export const selectProximityState = (state: RootState) =>
  state.wallet.proximity.state;
