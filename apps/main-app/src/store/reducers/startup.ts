import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { BiometricState } from '@io-eudiw-app/identification';

/* State type definition for the startup slice
 * startUpStatus - Status of the startup process
 * hasScreenLock - Indicates if the device has a screen lock
 * biometricState - Indicates the state of the biometric on the device
 */
export type StartupSlice = {
  startUpStatus:
    | 'DONE'
    | 'WAIT_ONBOARDING'
    | 'WAIT_IDENTIFICATION'
    | 'WAIT_MINI_APP_SELECTION'
    | 'LOADING'
    | 'ERROR'
    | 'NOT_STARTED';
  hasScreenLock: boolean;
  biometricState: BiometricState;
};

// Initial state for the startup slice
const initialState: StartupSlice = {
  startUpStatus: 'NOT_STARTED',
  hasScreenLock: false,
  biometricState: 'NOT_SUPPORTED'
};

/**
 * Redux slice for the startup state.
 */
export const startupSlice = createSlice({
  name: 'startup',
  initialState,
  reducers: {
    startupSetStatus: (
      state,
      action: PayloadAction<StartupSlice['startUpStatus']>
    ) => {
      state.startUpStatus = action.payload;
    },
    startupSetAttributes: (
      state,
      action: PayloadAction<Omit<StartupSlice, 'startUpStatus'>>
    ) => {
      state.biometricState = action.payload.biometricState;
      state.hasScreenLock = action.payload.hasScreenLock;
    },
    startupSetError: state => {
      state.startUpStatus = 'ERROR';
    },
    startupSetLoading: state => {
      state.startUpStatus = 'LOADING';
    }
  }
});

/**
 * Exports the actions for the startup slice.
 */
export const {
  startupSetError,
  startupSetLoading,
  startupSetStatus,
  startupSetAttributes
} = startupSlice.actions;

/**
 * Selects the startup state of the app.
 * @param state - The root state of the Redux store
 * @returns the startup state of the app
 */
export const selectStartupStatus = (state: RootState) =>
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
