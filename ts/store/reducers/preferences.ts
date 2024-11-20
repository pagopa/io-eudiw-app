/* eslint-disable functional/immutable-data */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, type PersistConfig} from 'redux-persist';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';

/* State type definition for the onboarding slice
 * isFingerprintAck - Indicates if the user has acknowledged the fingerprint prompt which asks to enable biometric authentication
 * firstOnboardingCompleted - Indicates if the first onboarding has been completed
 */
export type PreferencesState = {
  isOnboardingComplete: boolean;
  isFingerprintEnabled: boolean;
};

// Initial state for the preferences slice
const initialState: PreferencesState = {
  isOnboardingComplete: false,
  isFingerprintEnabled: false
};

/**
 * Redux slice for the preferences state. It contains information about the preferences state.
 */
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    preferencesSetIsOnboardingDone: state => {
      state.isOnboardingComplete = true;
    },
    // Fingerpint
    preferencesSetIsFingerprintEnabled: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isFingerprintEnabled = action.payload;
    },
    preferencesReset: () => initialState
  }
});

/**
 * Exports the actions for the preferences slice.
 */
export const {
  preferencesSetIsOnboardingDone,
  preferencesSetIsFingerprintEnabled,
  preferencesReset
} = preferencesSlice.actions;

/**
 * Redux persist configuration for the preferences slice.
 * Currently it uses AsyncStorage as the storage engine which stores it unencrypted in the device storage.
 */
const preferencesPersist: PersistConfig<PreferencesState> = {
  key: 'preferences',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the preferences slice.
 */
export const preferencesReducer = persistReducer(
  preferencesPersist,
  preferencesSlice.reducer
);

/**
 * Selects if the onboarding has been completed.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating weather the onboarding has been completed
 */
export const selectisOnboardingComplete = (state: RootState) =>
  state.preferences.isOnboardingComplete;
