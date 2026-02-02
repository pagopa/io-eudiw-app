/* eslint-disable functional/immutable-data */
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ISO18013_5 } from '@pagopa/io-react-native-iso18013';
import { RootState } from '../../../store/types';
import { preferencesReset } from '../../../store/reducers/preferences';
import { ParsedCredential } from '../utils/itwTypesUtils';
import { ProximityDetails } from '../screens/proximity/ItwProximityPresentationDetails';
import { resetLifecycle } from './lifecycle';

/**
 * The application-internal statuses used to control the proximity listener
 * These are not direct mappings of the {@link Proximity.Events}
 */
export enum ProximityStatus {
  PROXIMITY_STATUS_STARTED = 'started',
  PROXIMITY_STATUS_STOPPED = 'stopped',
  PROXIMITY_STATUS_ABORTED = 'aborted',
  PROXIMITY_STATUS_CONNECTED = 'connected',
  PROXIMITY_STATUS_RECEIVED_DOCUMENT = 'received-document',
  PROXIMITY_STATUS_AUTHORIZATION_STARTED = 'authorization-started',
  PROXIMITY_STATUS_AUTHORIZATION_SEND = 'authorization-send',
  PROXIMITY_STATUS_AUTHORIZATION_REJECTED = 'authorization-rejected',
  PROXIMITY_STATUS_AUTHORIZATION_COMPLETE = 'authorization-complete',
  PRXOMIMITY_STATUS_ERROR_AUTHORIZED = 'error-authorized',
  PROXIMITY_STATUS_ERROR = 'error'
}

/**
 * Type representing a descriptor containing info useful to render
 * a proximity presentation on screen and create the {@link AcceptedFields}
 */
export type ProximityDisclosure = {
  descriptor: Record<
    string,
    Record<string, Record<string, ParsedCredential[string]>>
  >;
};

/* State type definition for the proximity slice
 * qrCode - The qr code to be displayed for starting the proximity process
 * error - Cotains the error object if any error occurs during the proximity process
 * state - The state of the proximity process
 */
export type ProximityState = {
  qrCode?: string;
  status: ProximityStatus;
  documentRequest?: ISO18013_5.VerifierRequest;
  proximityDisclosureDescriptor?: ProximityDetails;
  errorDetails?: string;
};

// Initial state for the proximity slice
const initialState: ProximityState = {
  qrCode: undefined,
  status: ProximityStatus.PROXIMITY_STATUS_STOPPED,
  errorDetails: undefined,
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
    setProximityStatusStarted: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_STARTED;
    },
    setProximityStatusStopped: state => {
      if (
        state.status ===
          ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE ||
        state.status ===
          ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_REJECTED ||
        state.status === ProximityStatus.PROXIMITY_STATUS_STOPPED
      ) {
        state.status = ProximityStatus.PROXIMITY_STATUS_STOPPED;
      } else {
        state.status = ProximityStatus.PROXIMITY_STATUS_ABORTED;
      }
    },
    setProximityStatusConnected: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_CONNECTED;
    },
    setProximityStatusError: (state, action: PayloadAction<string>) => {
      state.status =
        state.status ===
          ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE ||
        state.status === ProximityStatus.PRXOMIMITY_STATUS_ERROR_AUTHORIZED
          ? ProximityStatus.PRXOMIMITY_STATUS_ERROR_AUTHORIZED
          : ProximityStatus.PROXIMITY_STATUS_ERROR;
      if (action) {
        state.errorDetails = action.payload;
      }
    },
    setProximityStatusReceivedDocument: (
      state,
      action: PayloadAction<ISO18013_5.VerifierRequest>
    ) => {
      state.status = ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT;
      state.documentRequest = action.payload;
    },
    setProximityStatusAuthorizationStarted: (
      state,
      action: PayloadAction<ProximityDetails>
    ) => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED;
      state.proximityDisclosureDescriptor = action.payload;
    },
    setProximityStatusAuthorizationSend: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND;
    },
    setProximityStatusAuthorizationRejected: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_REJECTED;
    },
    setProximityStatusAuthorizationComplete: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE;
    },
    setProximityQrCode: (state, action: PayloadAction<string>) => {
      state.qrCode = action.payload;
    },
    resetProximityQrCode: state => (state.qrCode = undefined),
    resetProximity: _ => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
    // This happens when the wallet state is reset
    builder.addCase(resetLifecycle, _ => initialState);
  }
});

/**
 * Exports the actions for the proximity slice.
 */
export const {
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
export const { reducer: proximityReducer } = proximitySlice;

/**
 * Selects the Engagement QR Code
 * @param state - The root state
 * @returns The QR Code if present, undefined otherwise
 */
export const selectProximityQrCode = (state: RootState) =>
  state.wallet.proximity.qrCode;

/**
 * Selects the proximity status
 * @param state - The root state
 * @returns The proximity status
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
 * Selects the verifier authentication flags
 * @param state - The root state
 * @returns The verifier authentication flags
 */
export const selectProximityDisclosureIsAuthenticated = createSelector(
  (state: RootState) => state.wallet.proximity.proximityDisclosureDescriptor,
  descriptor => descriptor?.[0]?.isAuthenticated || false
);

/**
 * Selects the error details
 * @param state - The root state
 * @returns The error details
 */
export const selectProximityErrorDetails = (state: RootState) =>
  state.wallet.proximity.errorDetails;
