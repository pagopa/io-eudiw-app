import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import { persistReducer, type PersistConfig } from 'redux-persist';

export type TypefaceChoice = 'comfortable' | 'standard';

/* State type definition for the preferences slice
 * sessionId - Randomly generated session id which identifies a wallet when creating a wallet instance. It gets resetted when the onboarding
 * gets resetted as well.
 * isOnboardingComplete - Indicates if the user has completed the onboarding flow.
 * isBiometricEnabled - Indicates if the biometric is enabled for the user.
 */
export type PreferencesSlice = {
  sessionId: string;
  isOnboardingComplete: boolean;
  isBiometricEnabled: boolean;
  isFirstStartup: boolean;
  selectedMiniAppId?: string;
  fontPreference: TypefaceChoice;
};

export type PreferencesPartialRootState = {
  preferences: PreferencesSlice;
};

// Initial state for the preferences slice
const initialState: PreferencesSlice = {
  sessionId: Crypto.randomUUID().toString(),
  isOnboardingComplete: false,
  isBiometricEnabled: false,
  isFirstStartup: true,
  selectedMiniAppId: undefined,
  fontPreference: 'comfortable'
};

/**
 * Redux slice for the preferences state. It contains information about the preferences state.
 */
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    // Onboarding
    preferencesSetIsOnboardingDone: state => {
      state.isOnboardingComplete = true;
    },
    // Fingerpint
    preferencesSetIsBiometricEnabled: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isBiometricEnabled = action.payload;
    },
    preferencesSetIsFirstStartupFalse: state => {
      state.isFirstStartup = false;
    },
    // Font
    preferencesFontSet: (state, action: PayloadAction<TypefaceChoice>) => {
      state.fontPreference = action.payload;
    },
    preferencesSetSelectedMiniAppId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.selectedMiniAppId = action.payload;
    },
    preferencesReset: () => initialState
  }
});

/**
 * Exports the actions for the preferences slice.
 */
export const {
  preferencesSetIsOnboardingDone,
  preferencesSetIsBiometricEnabled,
  preferencesSetIsFirstStartupFalse,
  preferencesSetSelectedMiniAppId,
  preferencesFontSet,
  preferencesReset
} = preferencesSlice.actions;

/**
 * Redux persist configuration for the preferences slice.
 * Currently it uses AsyncStorage as the storage engine which stores it unencrypted in the device storage.
 */
const preferencesPersist: PersistConfig<PreferencesSlice> = {
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
 * @returns a boolean indicating whether the onboarding has been completed
 */
export const selectIsOnboardingComplete = (
  state: PreferencesPartialRootState
) => state.preferences.isOnboardingComplete;

/**
 * Selects if the biometric is enabled.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating whether the biometric is enabled
 */
export const selectIsBiometricEnabled = (state: PreferencesPartialRootState) =>
  state.preferences.isBiometricEnabled;

/**
 * Selects if this is the first startup of the app.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating whether this is the first startup of the app
 */
export const selectIsFirstStartup = (state: PreferencesPartialRootState) =>
  state.preferences.isFirstStartup;

/**
 * Selects the session id of the wallet
 * @param state - The root state of the Redux store
 * @returns a randomly generated uuid
 */
export const selectSessionId = (state: PreferencesPartialRootState) =>
  state.preferences.sessionId;

export const selectFontPreference = (
  state: PreferencesPartialRootState
): TypefaceChoice => state.preferences.fontPreference;

export const selectSelectedMiniAppId = (state: PreferencesPartialRootState) =>
  state.preferences.selectedMiniAppId;
