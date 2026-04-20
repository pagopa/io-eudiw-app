import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../types';

/**
 * State definition for the deep linking slice.
 * It contains the pending URL coming from a deep link.
 */
type DeepLinkingSlice = {
  url: string | undefined;
};

// Initial state for the deeplinking slice
const initialState: DeepLinkingSlice = {
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
    }
  }
});

export const { reducer: deepLinkingReducer } = deeplinkingSlice;

/**
 * Exports the actions for the credentials slice.
 */
export const { setUrl } = deeplinkingSlice.actions;

/**
 * Select the pending url from the deep linking state.
 * @param state - The root state.
 * @returns The pending url from the deep linking state.
 */
export const selectUrl = (state: RootState) => state.deepLinking.url;
