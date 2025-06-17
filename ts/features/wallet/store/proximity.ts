/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  AcceptedFields,
  VerifierRequest,
  Proximity
} from '@pagopa/io-react-native-proximity';
import {RootState} from '../../../store/types';
import {ParsedCredential} from '../utils/types';

/**
 * The application-internal statuses used to control the proximity saga
 * These are not direct mappings of the {@link Proximity.Events}
 */
type ProximityStatus =
  | 'started'
  | 'stopped'
  | 'aborted'
  | 'connected'
  | 'received-document'
  | 'authorization-started'
  | 'authorization-send'
  | 'authorization-rejected'
  | 'authorization-complete'
  | 'error';

/**
 * Type representing a descriptor containing info useful to render
 * a proximity presentation on screen and create the {@link AcceptedFields}
 */
export type ProximityDisclosureDescriptor = Record<
  string,
  Record<string, Record<string, ParsedCredential[string]>>
>;

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
  proximityDisclosureDescriptor?: ProximityDisclosureDescriptor;
  proximityAcceptedFields?: AcceptedFields;
};

// Initial state for the proximity slice
const initialState: ProximityState = {
  qrCode: undefined,
  logBox: 'START OF THE LOG',
  status: 'stopped',
  documentRequest: undefined,
  proximityDisclosureDescriptor: undefined
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
      if (
        state.status === 'authorization-complete' ||
        state.status === 'authorization-rejected'
      ) {
        state.status = 'stopped';
      } else {
        state.status = 'aborted';
      }
    },
    setProximityStatusConnected: state => {
      state.status = 'connected';
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
    setProximityStatusAuthorizationStarted: (
      state,
      action: PayloadAction<ProximityDisclosureDescriptor>
    ) => {
      state.status = 'authorization-started';
      state.proximityDisclosureDescriptor = action.payload;
    },
    setProximityStatusAuthorizationSend: (
      state,
      action: PayloadAction<AcceptedFields>
    ) => {
      state.status = 'authorization-send';
      state.proximityAcceptedFields = action.payload;
    },
    setProximityStatusAuthorizationRejected: state => {
      state.status = 'authorization-rejected';
    },
    setProximityStatusAuthorizationComplete: state => {
      state.status = 'authorization-complete';
    },
    setProximityQrCode: (state, action: PayloadAction<string>) => {
      state.qrCode = action.payload;
    },
    resetProximityQrCode: state => (state.qrCode = undefined),
    resetProximity: _ => initialState
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
  setProximityStatusConnected,
  setProximityStatusError,
  setProximityStatusReceivedDocument,
  setProximityStatusAuthorizationStarted,
  setProximityStatusAuthorizationSend,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationComplete,
  setProximityQrCode,
  resetProximityQrCode,
  resetProximity
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

/**
 * Selects the Engagement QR Code
 * @param state - The root state
 * @returns The QR Code if present, undefined otherwise
 */
export const selectProximityQrCode = (state: RootState) =>
  state.wallet.proximity.qrCode;

/**
 * Selects the saga status
 * @param state - The root state
 * @returns The saga status
 */
export const selectProximityStatus = (state: RootState) =>
  state.wallet.proximity.status;

/**
 * Selects the request sent by a Verifier App
 * @param state - The root state
 * @returns The request sent by the Verifier App
 */
export const selectProximityDocumentRequest = (state: RootState) =>
  state.wallet.proximity.documentRequest;

/**
 * Selects the descriptor proccessed from the {@link VerifierRequest}
 * @param state - The root state
 * @returns A {@link ProximityDisclosureDescriptor}
 */
export const selectProximityDisclosureDescriptor = (state: RootState) =>
  state.wallet.proximity.proximityDisclosureDescriptor;

/**
 * Selects the {@link AcceptedFields} the user chose to share
 * @param state - The root state
 * @returns The {@link AcceptedFields} the user chose to share
 */
export const selectProximityAcceptedFields = (state: RootState) =>
  state.wallet.proximity.proximityAcceptedFields;
