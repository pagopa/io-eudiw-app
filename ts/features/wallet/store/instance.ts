/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';
import {preferencesReset} from '../../../store/reducers/preferences';

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
  }
});

/**
 * Exports the actions for the instance slice.
 */
export const {setInstanceKeyTag, resetInstanceKeyTag} = instanceSlice.actions;

export const {reducer: instanceReducer} = instanceSlice;

/**
 * Select the wallet instance keytag.
 * @param state - The root state
 * @returns the wallet instance keytag
 */
export const selectInstanceKeyTag = (state: RootState) =>
  state.wallet.instance.keyTag;
