/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../store/types';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';
import {StoredCredential} from '../utils/types';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type PidIssuanceStatusState = {
  instanceCreation: AsyncStatusValues;
  issuance: AsyncStatusValues<StoredCredential>;
};

// Initial state for the pin slice
const initialState: PidIssuanceStatusState = {
  instanceCreation: setInitial(),
  issuance: setInitial()
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
export const pidIssuanceStatusSlice = createSlice({
  name: 'pidIssuanceStatus',
  initialState,
  reducers: {
    setInstanceCreationRequest: state => {
      state.instanceCreation = setLoading();
    },
    setInstanceCreationError: (
      state,
      action: PayloadAction<{error: unknown}>
    ) => {
      state.instanceCreation = setError(action.payload.error);
    },
    setInstanceCreationSuccess: state => {
      state.instanceCreation = setSuccess();
    },
    resetInstanceCreation: state => {
      state.instanceCreation = setInitial();
    },
    setPidIssuanceRequest: state => {
      state.issuance = setLoading();
    },
    setPidIssuanceError: (state, action: PayloadAction<{error: unknown}>) => {
      state.issuance = setError(action.payload.error);
    },
    setPidIssuanceSuccess: (
      state,
      action: PayloadAction<{credential: StoredCredential}>
    ) => {
      state.issuance = setSuccess(action.payload.credential);
    },
    resetPidIssuance: state => {
      state.issuance = setInitial();
    }
  }
});

/**
 * Exports the actions for the pin slice.
 */
export const {
  setInstanceCreationRequest,
  setInstanceCreationError,
  setInstanceCreationSuccess,
  resetInstanceCreation,
  setPidIssuanceRequest,
  setPidIssuanceError,
  setPidIssuanceSuccess,
  resetPidIssuance
} = pidIssuanceStatusSlice.actions;

export const {reducer: pidIssuanceStatusReducer} = pidIssuanceStatusSlice;

export const selectInstanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.instanceCreation;

export const selectPidIssuanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance;

export const selectPidIssuance = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance.success.status === true
    ? state.wallet.pidIssuanceStatus.issuance.success.data
    : undefined;
