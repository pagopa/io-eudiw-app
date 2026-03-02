import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { preferencesReset } from './preferences';

/**
 * The identification state.
 * - status: The status of the identification process.
 * - canResetPin: If the pin can be reset in the identification modal.
 * - isValidatingTask: If the identification is validating a task and thus a different text and pictogram are shown.
 */
type IdentificationState = {
  status: 'started' | 'identified' | 'unidentified';
  canResetPin: boolean;
  isValidatingTask: boolean;
};

const initialState: IdentificationState = {
  status: 'unidentified',
  canResetPin: false,
  isValidatingTask: false
};

/**
 * Redux slice for the identification state. It allows to show the identification modal.
 */
const identificationSlice = createSlice({
  name: 'identification',
  initialState,
  reducers: {
    setIdentificationStarted: (
      state,
      action: PayloadAction<Omit<IdentificationState, 'status'>>
    ) => {
      state.status = 'started';
      state.canResetPin = action.payload.canResetPin;
      state.isValidatingTask = action.payload.isValidatingTask;
    },
    setIdentificationIdentified: state => {
      state.status = 'identified';
    },
    setIdentificationUnidentified: state => {
      state.status = 'unidentified';
    }
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

/**
 * Exports the actions for the identification slice.
 */
export const {
  setIdentificationStarted,
  setIdentificationIdentified,
  setIdentificationUnidentified
} = identificationSlice.actions;

export const identificationReducer = identificationSlice.reducer;

/**
 * Select the identification status.
 * @param state - The root state.
 * @returns The identification state.
 */
export const selectIdentificationStatus = (state: RootState) =>
  state.identification;
