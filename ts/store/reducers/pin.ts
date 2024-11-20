/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import {RootState} from '../types';
import {PinString} from '../../features/onboarding/types/PinString';
import secureStoragePersistor from '../persistors/secureStorage';

/* State type definition for the onboarding slice
 * isFingerprintAck - Indicates if the user has acknowledged the fingerprint prompt which asks to enable biometric authentication
 * firstOnboardingCompleted - Indicates if the first onboarding has been completed
 */
export type PreferencesState = Readonly<{
  pin: PinString | undefined;
}>;

// Initial state for the onboarding slice
const initialState: PreferencesState = {
  pin: undefined
};

/**
 * Redux slice for the onboarding state. It contains information about the onboarding state.
 */
const pinSlice = createSlice({
  name: 'pin',
  initialState,
  reducers: {
    pinSet: (state, action: PayloadAction<PinString>) => {
      state.pin = action.payload;
    },
    // Resets the session state when logging out
    pinReset: () => initialState
  }
});

/**
 * Exports the actions for the onboarding slice.
 */
export const {pinSet, pinReset} = pinSlice.actions;

/**
 * Redux persist configuration for the preferences slice.
 * Currently it uses AsyncStorage as the storage engine which stores it unencrypted in the device storage.
 */
const pinPersist: PersistConfig<PreferencesState> = {
  key: 'pin',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the preferences slice.
 */
export const pinReducer = persistReducer(pinPersist, pinSlice.reducer);

/**
 * Selects if the onboarding has been completed.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating weather the onboarding has been completed
 */
export const selectPin = (state: RootState) => state.pin.pin;
