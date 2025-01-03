/* eslint-disable functional/immutable-data */
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import {PersistConfig, persistReducer} from 'redux-persist';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {RootState} from '../types';

type DebugState = Readonly<{
  isDebugModeEnabled: boolean;
  debugData: Record<string, any>;
}>;

const initialState: DebugState = {
  isDebugModeEnabled: false,
  debugData: {}
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
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
 * Exports the actions for the pin slice.
 */
export const {setDebugModeEnabled, setDebugData, resetDebugData} =
  debugSlice.actions;

const debugPersist: PersistConfig<DebugState> = {
  key: 'debug',
  storage: AsyncStorage,
  whitelist: ['isDebugModeEnabled']
};

/**
 * Persisted reducer for the pin slice.
 */
export const debugReducer = persistReducer(debugPersist, debugSlice.reducer);

// Selector
export const selectIsDebugModeEnabled = (state: RootState) =>
  state.debug.isDebugModeEnabled;

export const selectDebugData = (state: RootState) => state.debug.debugData;
