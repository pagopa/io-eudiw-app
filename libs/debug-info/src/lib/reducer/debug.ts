import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';

import { DebugCombinedRootState } from '.';

/*
 * State type definition for the debug  slice
 * isDebugModeEnabled - Indicates if the debug mode is enabled or not
 * debugData - Data that is used for debugging purposes
 */
export type DebugSlice = Readonly<{
  debugData: Record<string, unknown>;
  isDebugModeEnabled: boolean;
}>;

// Initial state for the debug slice
const initialState: DebugSlice = {
  debugData: {},
  isDebugModeEnabled: true
};

/**
 * Redux slice for the debug state. It allows to enable and disable the debug mode and set debug data.
 */
const debugSlice = createSlice({
  initialState,
  name: 'debug',
  reducers: {
    resetDebugData(state, action: PayloadAction<readonly string[]>) {
      state.debugData = Object.fromEntries(
        Object.entries(state.debugData).filter(
          ([key]) => !action.payload.includes(key)
        )
      );
    },
    setDebugData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.debugData = {
        ...state.debugData,
        ...action.payload
      };
    },
    setDebugModeEnabled: (state, action: PayloadAction<{ state: boolean }>) => {
      state.isDebugModeEnabled = action.payload.state;
      state.debugData = {};
    }
  }
});

/**
 * Exports the actions for the debug slice.
 */
export const { resetDebugData, setDebugData, setDebugModeEnabled } =
  debugSlice.actions;

const debugPersist: PersistConfig<DebugSlice> = {
  key: 'debug',
  storage: AsyncStorage,
  whitelist: ['isDebugModeEnabled']
};

/**
 * Persisted reducer for the debug slice.
 */
export const debugRootReducer = persistReducer(
  debugPersist,
  debugSlice.reducer
);

/**
 * Selects the debug mode state.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating if the debug mode is enabled
 */
export const selectIsDebugModeEnabled = (state: DebugCombinedRootState) =>
  state.debug.isDebugModeEnabled;

/**
 * Selects the debug data.
 * @param state - The root state of the Redux store
 * @returns a record with the debug data
 */
export const selectDebugData = (state: DebugCombinedRootState) =>
  state.debug.debugData;
