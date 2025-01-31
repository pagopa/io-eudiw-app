/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {preferencesReset} from './preferences';

/* State type definition for the credentials slice.
 * This is stored as an array to avoid overhead due to map not being serializable,
 * thus needing to be converted to an array with a transformation.
 * pid - The PID credential
 * credentials - A map of all the stored credentials
 */
export type DeepLinkingState = {
  url: string | undefined;
};

// Initial state for the credential slice
const initialState: DeepLinkingState = {
  url: undefined
};

/**
 * Redux slice for the credential state. It allows to store the PID and other credentials.
 * This must be a separate slice because the credentials are stored using a custom persistor.
 */
const deeplinkingSlice = createSlice({
  name: 'deeplinking',
  initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<{url: string}>) => {
      state.url = action.payload.url;
    },
    resetUrl: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

export const {reducer: deepLinkingReducer} = deeplinkingSlice;

export const credentialsSelector = (state: RootState) =>
  state.wallet.credentials;

/**
 * Exports the actions for the credentials slice.
 */
export const {setUrl, resetUrl} = deeplinkingSlice.actions;

export const selectUrl = (state: RootState) => state.deepLinking.url;
