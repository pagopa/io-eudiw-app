/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {BiometricState} from '../../features/onboarding/utils/biometric';

/* State type definition for the onboarding slice
 * isFingerprintAck - Indicates if the user has acknowledged the fingerprint prompt which asks to enable biometric authentication
 * firstOnboardingCompleted - Indicates if the first onboarding has been completed
 */
export type StartupState = {
  startUpStatus: 'DONE' | 'LOADING' | 'ERROR' | 'NOT_STARTED';
  hasScreenLock: boolean;
  biometricState: BiometricState;
};

// Initial state for the onboarding slice
const initialState: StartupState = {
  startUpStatus: 'NOT_STARTED',
  hasScreenLock: false,
  biometricState: 'NotSupported'
};

/**
 * Redux slice for the onboarding state. It contains information about the onboarding state.
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
    // Resets the session state when logging out
    startupReset: () => initialState
  }
});

/**
 * Exports the actions for the onboarding slice.
 */
export const {
  startupSetDone,
  startupSetError,
  startupSetLoading,
  startupReset
} = startupSlice.actions;

/**
 * Selects if the onboarding has been completed.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating weather the onboarding has been completed
 */
export const selectStartupState = (state: RootState) =>
  state.startup.startUpStatus;

export const selectStartupBiometricState = (state: RootState) =>
  state.startup.biometricState;

export const selectStartupHasScreenLock = (state: RootState) =>
  state.startup.hasScreenLock;
