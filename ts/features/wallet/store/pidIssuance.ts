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

/* State type definition for the pidIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the PID issuance
 */
export type PidIssuanceStatusState = {
  instanceCreation: AsyncStatusValues;
  issuance: AsyncStatusValues<StoredCredential>;
};

// Initial state for the pidIssuance slice
const initialState: PidIssuanceStatusState = {
  instanceCreation: setInitial(),
  issuance: setInitial()
};

/**
 * Redux slice for the pidIssuance state. It holds the status of flows related to the PID issuance
 * allowing to handle the UI accordingly with a request, loading and success/error states along with their data, if necessary.
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
 * Exports the actions for the pidIssuance slice.
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

/**
 * Exports the reducer for the pidIssuance slice.
 */
export const {reducer: pidIssuanceStatusReducer} = pidIssuanceStatusSlice;

/**
 * Selects the instanceCreation async status.
 * @param state - The root state
 * @returns The instanceCreation async status
 */
export const selectInstanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.instanceCreation;

/**
 * Selects the issuance async status.
 * @param state - The root state
 * @returns The issuance async status
 */
export const selectPidIssuanceStatus = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance;

/**
 * Selects the issuance data if the status is success.
 * @param state - The root state
 * @returns The issuance data if the status is success, otherwise undefined
 */
export const selectPidIssuanceData = (state: RootState) =>
  state.wallet.pidIssuanceStatus.issuance.success.status === true
    ? state.wallet.pidIssuanceStatus.issuance.success.data
    : undefined;
