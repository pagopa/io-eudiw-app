/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type InstanceState = {
  keyTag: string | undefined;
};

// Initial state for the pin slice
const initialState: InstanceState = {
  keyTag: undefined
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
const instanceSlice = createSlice({
  name: 'instance',
  initialState,
  reducers: {
    setInstanceKeyTag: (state, action: PayloadAction<string>) => {
      state.keyTag = action.payload;
    },
    resetInstanceKeyTag: () => initialState
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const {setInstanceKeyTag, resetInstanceKeyTag} = instanceSlice.actions;

export const {reducer: instanceReducer} = instanceSlice;

export const selectInstanceKeyTag = (state: RootState) =>
  state.wallet.instance.keyTag;
