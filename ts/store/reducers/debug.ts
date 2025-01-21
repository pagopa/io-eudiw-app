/* eslint-disable functional/immutable-data */
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import {PersistConfig, persistReducer} from 'redux-persist';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {RootState} from '../types';

/*
 * State type definition for the debug  slice
 * isDebugModeEnabled - Indicates if the debug mode is enabled or not
 * debugData - Data that is used for debugging purposes
 */
type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
  debugData: Record<string, any>;
}>;

// Initial state for the debug slice
const initialState: DebugState = {
  isDebugModeEnabled: false,
  debugData: {}
};

/**
 * Redux slice for the debug state. It allows to enable and disable the debug mode and set debug data.
 */
const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    setDebugModeEnabled: (state, action: PayloadAction<{state: boolean}>) => {
      state.isDebugModeEnabled = action.payload.state;
      state.debugData = {};
    },
    setDebugData: (state, action: PayloadAction<Record<string, any>>) => {
      state.debugData = _.merge(state.debugData, action.payload);
    },
    resetDebugData(state, action: PayloadAction<ReadonlyArray<string>>) {
      state.debugData = Object.fromEntries(
        Object.entries(state.debugData).filter(
          ([key]) => !action.payload.includes(key)
        )
      );
    }
  }
});

/**
 * Exports the actions for the debug slice.
 */
export const {setDebugModeEnabled, setDebugData, resetDebugData} =
  debugSlice.actions;

const debugPersist: PersistConfig<DebugState> = {
  key: 'debug',
  storage: AsyncStorage,
  whitelist: ['isDebugModeEnabled']
};

/**
 * Persisted reducer for the debug slice.
 */
export const debugReducer = persistReducer(debugPersist, debugSlice.reducer);

/**
 * Selects the debug mode state.
 * @param state - The root state of the Redux store
 * @returns a boolean indicating if the debug mode is enabled
 */
export const selectIsDebugModeEnabled = (state: RootState) =>
  state.debug.isDebugModeEnabled;

/**
 * Selects the debug data.
 * @param state - The root state of the Redux store
 * @returns a record with the debug data
 */
export const selectDebugData = (state: RootState) => state.debug.debugData;
