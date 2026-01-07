/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { RootState } from '../types';
import { PinString } from '../../features/onboarding/types/PinString';
import secureStoragePersistor from '../persistors/secureStorage';
import { preferencesReset } from './preferences';

/*
 * State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type PreferencesState = Readonly<{
  pin: PinString | undefined;
}>;

// Initial state for the pin slice
const initialState: PreferencesState = {
  pin: undefined
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
const pinSlice = createSlice({
  name: 'pin',
  initialState,
  reducers: {
    pinSet: (state, action: PayloadAction<PinString>) => {
      state.pin = action.payload;
    },
    pinReset: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const { pinSet, pinReset } = pinSlice.actions;

/**
 * Redux persist configuration for the pin slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const pinPersist: PersistConfig<PreferencesState> = {
  key: 'pin',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the pin slice.
 */
export const pinReducer = persistReducer(pinPersist, pinSlice.reducer);

/**
 * Selects the pin.
 * @param state - The root state of the Redux store
 * @returns a string representing the pin
 */
export const selectPin = (state: RootState) => state.pin.pin;
