/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {VerifierRequest} from '@pagopa/io-react-native-proximity';
import {RootState} from '../../../store/types';

type ProximityStatus =
  | 'started'
  | 'stopped'
  | 'received-document'
  | 'authorization-started'
  | 'authorization-complete'
  | 'authorization-rejected'
  | 'error';

/* State type definition for the proximity slice
 * qrCode - The qr code to be displayed for starting the proximity process
 * error - Cotains the error object if any error occurs during the proximity process
 * state - The state of the proximity process
 */
export type ProximityState = {
  qrCode?: string;
  logBox: string;
  status: ProximityStatus;
  documentRequest?: VerifierRequest;
};

// Initial state for the proximity slice
const initialState: ProximityState = {
  qrCode: undefined,
  logBox: 'START OF THE LOG',
  status: 'stopped',
  documentRequest: undefined
};

/**
 * Redux slice for the proximity state. It holds the status of flows related to the proximity process.
 */
export const proximitySlice = createSlice({
  name: 'proximitySlice',
  initialState,
  reducers: {
    addProximityLog: (state, action: PayloadAction<string>) => {
      state.logBox = `${state.logBox} \n ============== \n ${action.payload}`;
    },
    resetProximityLog: () => initialState,
    setProximityStatusStarted: state => {
      state.status = 'started';
    },
    setProximityStatusStopped: state => {
      state.status = 'stopped';
    },
    setProximityStatusError: state => {
      state.status = 'error';
    },
    setProximityStatusReceivedDocument: (
      state,
      action: PayloadAction<VerifierRequest>
    ) => {
      state.status = 'received-document';
      state.documentRequest = action.payload;
    },
    setProximityStatusAuthorizationStarted: state => {
      state.status = 'authorization-started';
    },
    setProximityStatusAuthorizationComplete: state => {
      state.status = 'authorization-complete';
    },
    setProximityStatusAuthorizationRejected: state => {
      state.status = 'authorization-rejected';
    },
    setProximityQrCode: (state, action: PayloadAction<string>) => {
      state.qrCode = action.payload;
    },
    resetProximityQrCode: state => (state.qrCode = undefined)
  }
});

/**
 * Exports the actions for the proximity slice.
 */
export const {
  addProximityLog,
  resetProximityLog,
  setProximityStatusStarted,
  setProximityStatusStopped,
  setProximityStatusError,
  setProximityStatusReceivedDocument,
  setProximityStatusAuthorizationStarted,
  setProximityStatusAuthorizationComplete,
  setProximityStatusAuthorizationRejected,
  setProximityQrCode,
  resetProximityQrCode
} = proximitySlice.actions;

/**
 * Exports the reducer for the proximity slice.
 */
export const {reducer: proximityReducer} = proximitySlice;

/**
 * Selects the proximity state from the state.
 * @param state - The root state
 * @returns The state of the proximity process.
 */
export const selectProximityLogBoxState = (state: RootState) =>
  state.wallet.proximity.logBox;

export const selectProximityQrCode = (state: RootState) =>
  state.wallet.proximity.qrCode;

export const selectProximityStatus = (state: RootState) =>
  state.wallet.proximity.status;

export const selectProximityDocumentRequest = (state: RootState) =>
  state.wallet.proximity.documentRequest;
