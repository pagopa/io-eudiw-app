/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';

/* State type definition for the proximity slice
 * qrCode - The qr code to be displayed for starting the proximity process
 * error - Cotains the error object if any error occurs during the proximity process
 * state - The state of the proximity process
 */
export type ProximityState = {
  logBox: string;
};

// Initial state for the proximity slice
const initialState: ProximityState = {
  logBox: 'START OF THE LOG'
};

/**
 * Redux slice for the proximity state. It holds the status of flows related to the proximity process.
 */
export const proximitySlice = createSlice({
  name: 'proximitySlice',
  initialState,
  reducers: {
    addProximityLog: (state, action: PayloadAction<string>) => {
      state.logBox = `${state.logBox} \n ============== \n ${action.payload}`;
    },
    resetProximityLog: () => initialState
  }
});

/**
 * Exports the actions for the proximity slice.
 */
export const {addProximityLog, resetProximityLog} = proximitySlice.actions;

/**
 * Exports the reducer for the proximity slice.
 */
export const {reducer: proximityReducer} = proximitySlice;

/**
 * Selects the proximity state from the state.
 * @param state - The root state
 * @returns The state of the proximity process.
 */
export const selectProximityLogBoxState = (state: RootState) =>
  state.wallet.proximity.logBox;
