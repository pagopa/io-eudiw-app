import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * State definition for the deep linking slice.
 * It contains the pending URL coming from a deep link.
 */
export type DeepLinkingSlice = {
  url: string | undefined;
};

// Initial state for the deeplinking slice
const initialState: DeepLinkingSlice = {
  url: undefined
};

/**
 * Redux slice for the deeplinking state. It allows to store pending deep links which couldn't be handled.
 * A listener will take care of handling the deep link when the app is ready.
 *
 * Hoisted into the navigation lib so both the host app and mini-apps can read/write the
 * pending deep-link URL without crossing the app/lib boundary.
 */
const deeplinkingSlice = createSlice({
  name: 'deeplinking',
  initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<{ url: string }>) => {
      state.url = action.payload.url;
    },
    resetUrl: state => {
      state.url = undefined;
    }
  }
});

export const { reducer: deepLinkingReducer } = deeplinkingSlice;

/**
 * Exports the actions for the deeplinking slice.
 */
export const { setUrl, resetUrl } = deeplinkingSlice.actions;

/**
 * Minimal state shape required by the deeplinking selector.
 * Any store that mounts {@link deepLinkingReducer} under the `deepLinking` key satisfies it.
 */
export type DeepLinkingRootState = {
  deepLinking: DeepLinkingSlice;
};

/**
 * Select the pending url from the deep linking state.
 * @param state - A state holding the deep linking slice.
 * @returns The pending url from the deep linking state.
 */
export const selectUrl = (state: DeepLinkingRootState) => state.deepLinking.url;
