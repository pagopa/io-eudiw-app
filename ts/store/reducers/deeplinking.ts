/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { preferencesReset } from './preferences';

/**
 * State definition for the deep linking slice.
 * It contains the pending URL coming from a deep link.
 */
export type DeepLinkingState = {
  url: string | undefined;
};

// Initial state for the deeplinking slice
const initialState: DeepLinkingState = {
  url: undefined
};

/**
 * Redux slice for the deeplinking state. It allows to store pending deep links which couldn't be handled.
 * A listener will take care of handling the deep link when the app is ready.
 */
const deeplinkingSlice = createSlice({
  name: 'deeplinking',
  initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<{ url: string }>) => {
      state.url = action.payload.url;
    },
    resetUrl: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

export const { reducer: deepLinkingReducer } = deeplinkingSlice;

export const credentialsSelector = (state: RootState) =>
  state.wallet.credentials;

/**
 * Exports the actions for the credentials slice.
 */
export const { setUrl, resetUrl } = deeplinkingSlice.actions;

/**
 * Select the pending url from the deep linking state.
 * @param state - The root state.
 * @returns The pending url from the deep linking state.
 */
export const selectUrl = (state: RootState) => state.deepLinking.url;
