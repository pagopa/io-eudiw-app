/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {preferencesReset} from './preferences';

type IdentificationState = {
  status: 'started' | 'identified' | 'unidentified';
  canResetPin: boolean;
  isValidatingTask: boolean;
};

export const initialState: IdentificationState = {
  status: 'unidentified',
  canResetPin: false,
  isValidatingTask: false
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
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
    },
    resetIdentification: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const {
  setIdentificationStarted,
  setIdentificationIdentified,
  setIdentificationUnidentified,
  resetIdentification
} = identificationSlice.actions;

export const identificationReducer = identificationSlice.reducer;

export const selectIdentificationStatus = (state: RootState) =>
  state.identification;

export const selectIsValidationTask = (state: RootState) =>
  state.identification.status === 'started'
    ? state.identification.isValidatingTask
    : false;
