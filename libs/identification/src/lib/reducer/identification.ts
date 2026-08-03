import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IdentificationCombinedRootState } from '.';

/**
 * The identification state.
 * - status: The status of the identification process.
 * - canResetPin: If the pin can be reset in the identification modal.
 * - isValidatingTask: If the identification is validating a task and thus a different text and pictogram are shown.
 */
export type IdentificationSlice = {
  canResetPin: boolean;
  isValidatingTask: boolean;
  status: 'identified' | 'started' | 'unidentified';
};

export const initialState: IdentificationSlice = {
  canResetPin: false,
  isValidatingTask: false,
  status: 'unidentified'
};

/**
 * Redux slice for the identification state. It allows to show the identification modal.
 */
const identificationSlice = createSlice({
  extraReducers: builder => {
    // Reset the state when the preferences are reset or if it's the first startup.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'identification',
  reducers: {
    setIdentificationIdentified: state => {
      state.status = 'identified';
    },
    setIdentificationStarted: (
      state,
      action: PayloadAction<Omit<IdentificationSlice, 'status'>>
    ) => {
      state.status = 'started';
      state.canResetPin = action.payload.canResetPin;
      state.isValidatingTask = action.payload.isValidatingTask;
    },
    setIdentificationUnidentified: state => {
      state.status = 'unidentified';
    }
  }
});

/**
 * Exports the actions for the identification slice.
 */
export const {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} = identificationSlice.actions;

export const identificationReducer = identificationSlice.reducer;

/**
 * Select the identification status.
 * @param state - The root state.
 * @returns The identification state.
 */
export const selectIdentificationStatus = (
  state: IdentificationCombinedRootState
) => state.identification.identification;
