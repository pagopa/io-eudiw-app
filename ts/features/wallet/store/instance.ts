import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { preferencesReset } from '../../../store/reducers/preferences';
import { RootState } from '../../../store/types';
import { resetLifecycle } from './lifecycle';

/* State type definition for the instance slice
 * keyTag - The keytag bound to the wallet instance
 */
export type InstanceState = {
  keyTag: string | undefined;
};

// Initial state for the instance slice
const initialState: InstanceState = {
  keyTag: undefined
};

/**
 * Redux slice for the instance state. It allows to store and reset the keytag bound to the wallet instance.
 */
const instanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {
    setInstanceKeyTag: (state, action: PayloadAction<string>) => {
      state.keyTag = action.payload;
    },
    resetInstanceKeyTag: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
    // This happens when the wallet state is reset
    builder.addCase(resetLifecycle, _ => initialState);
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const instancePersist: PersistConfig<InstanceState> = {
  key: 'attestation',
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
export const { setInstanceKeyTag, resetInstanceKeyTag } = instanceSlice.actions;

/**
 * Select the wallet instance keytag.
 * @param state - The root state
 * @returns the wallet instance keytag
 */
export const selectInstanceKeyTag = (state: RootState) =>
  state.wallet.instance.keyTag;
