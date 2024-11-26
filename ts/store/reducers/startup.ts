/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {BiometricState} from '../../features/onboarding/utils/biometric';

/* State type definition for the startup slice
 * startUpStatus - Status of the startup process
 * hasScreenLock - Indicates if the device has a screen lock
 * biometricState - Indicates the state of the biometric on the device
 */
export type StartupState = {
  startUpStatus: 'DONE' | 'LOADING' | 'ERROR' | 'NOT_STARTED';
  hasScreenLock: boolean;
  biometricState: BiometricState;
};

// Initial state for the startup slice
const initialState: StartupState = {
  startUpStatus: 'NOT_STARTED',
  hasScreenLock: false,
  biometricState: 'NotSupported'
};

/**
 * Redux slice for the startup state.
 */
export const startupSlice = createSlice({
  name: 'startup',
  initialState,
  reducers: {
    // Startup section
    startupSetDone: (
      state,
      action: PayloadAction<Omit<StartupState, 'startUpStatus'>>
    ) => {
      state.startUpStatus = 'DONE';
      state.biometricState = action.payload.biometricState;
      state.hasScreenLock = action.payload.hasScreenLock;
    },
    startupSetError: state => {
      state.startUpStatus = 'ERROR';
    },
    startupSetLoading: state => {
      state.startUpStatus = 'LOADING';
    },
    startupReset: () => initialState
  }
});

/**
 * Exports the actions for the startup slice.
 */
export const {
  startupSetDone,
  startupSetError,
  startupSetLoading,
  startupReset
} = startupSlice.actions;

/**
 * Selects the startup state of the app.
 * @param state - The root state of the Redux store
 * @returns the startup state of the app
 */
export const selectStartupState = (state: RootState) =>
  state.startup.startUpStatus;

/**
 * Selects the biometric state of the app.
 * @param state - The root state of the Redux store
 * @returns the biometric state of the device
 */
export const selectStartupBiometricState = (state: RootState) =>
  state.startup.biometricState;

/**
 * Selects if the device has a screen lock.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating if the device has a screen lock
 */
export const selectStartupHasScreenLock = (state: RootState) =>
  state.startup.hasScreenLock;