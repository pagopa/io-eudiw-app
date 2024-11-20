/* eslint-disable functional/immutable-data */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, type PersistConfig} from 'redux-persist';
import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';

/* State type definition for the onboarding slice
 * isFingerprintAck - Indicates if the user has acknowledged the fingerprint prompt which asks to enable biometric authentication
 * firstOnboardingCompleted - Indicates if the first onboarding has been completed
 */
export type OnboardingState = Readonly<{
  isOnboardingComplete: boolean;
}>;

// Initial state for the onboarding slice
const initialState: OnboardingState = {
  isOnboardingComplete: false
};

/**
 * Redux slice for the onboarding state. It contains information about the onboarding state.
 */
export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    onboardingSetIsComplete: state => {
      state.isOnboardingComplete = true;
    },
    // Resets the session state when logging out
    onboardingReset: () => initialState
  }
});

/**
 * Exports the actions for the onboarding slice.
 */
export const {onboardingSetIsComplete, onboardingReset} =
  onboardingSlice.actions;

/**
 * Redux persist configuration for the onboarding slice.
 * Currently it uses AsyncStorage as the storage engine which stores it unencrypted in the device storage.
 */
const persistConfig: PersistConfig<OnboardingState> = {
  key: 'onboarding',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the onboarding slice.
 */
export const onboardingReducer = persistReducer(
  persistConfig,
  onboardingSlice.reducer
);

/**
 * Selects if the onboarding has been completed.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating weather the onboarding has been completed
 */
export const selectisOnboardingComplete = (state: RootState) =>
  state.onboarding.isOnboardingComplete;
