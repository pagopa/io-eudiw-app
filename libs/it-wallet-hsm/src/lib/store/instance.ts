import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import { PersistConfig, persistReducer } from 'redux-persist';

import { createInstanceThunk } from '../middleware/instance';
import { resetLifecycle } from './lifecycle';

/* State type definition for the instance slice
 * keyTag - The keytag bound to the wallet instance
 */
type InstanceSlice = {
  creation: AsyncStatusValues;
  keyTag: string | undefined;
  sessionId: string;
};

// Initial state for the instance slice
const initialState: InstanceSlice = {
  creation: setInitial(),
  keyTag: undefined,
  sessionId: Crypto.randomUUID().toString()
};

/**
 * Redux slice for the instance state. It allows to store and reset the keytag bound to the wallet instance.
 */
const instanceSlice = createSlice({
  extraReducers: builder => {
    builder.addCase(createInstanceThunk.fulfilled, state => {
      state.creation = setSuccess();
    });
    builder.addCase(createInstanceThunk.pending, state => {
      state.creation = setLoading();
    });
    builder.addCase(createInstanceThunk.rejected, (state, action) => {
      state.creation = action.meta.aborted
        ? setInitial()
        : setError(action.error);
    });
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'instance',
  reducers: {
    setInstanceKeyTag: (state, action: PayloadAction<string>) => {
      state.keyTag = action.payload;
    }
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const instancePersist: PersistConfig<InstanceSlice> = {
  key: 'instance',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the instance slice.
 */
export const instanceReducer = persistReducer(
  instancePersist,
  instanceSlice.reducer
);

/**
 * Exports the actions for the instance slice.
 */
export const { setInstanceKeyTag } = instanceSlice.actions;
