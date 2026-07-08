import { ISO18013_5 } from '@pagopa/io-react-native-iso18013';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProximityDetails } from '../screens/proximity/ItwProximityPresentationDetails';
import { WalletCombinedRootState } from '.';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
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
  PROXIMITY_STATUS_STORE_CONSENT = 'store-consent',
  PROXIMITY_STATUS_AUTHORIZATION_SEND = 'authorization-send',
  PROXIMITY_STATUS_AUTHORIZATION_REJECTED = 'authorization-rejected',
  PROXIMITY_STATUS_AUTHORIZATION_COMPLETE = 'authorization-complete',
  PRXOMIMITY_STATUS_ERROR_AUTHORIZED = 'error-authorized',
  PROXIMITY_STATUS_ERROR = 'error'
}

/**
 * Possible failure statuses of the Proximity middleware
 */
const PROXIMITY_FAILURE_STATUSES = [
  ProximityStatus.PROXIMITY_STATUS_ERROR,
  ProximityStatus.PROXIMITY_STATUS_ABORTED,
  ProximityStatus.PRXOMIMITY_STATUS_ERROR_AUTHORIZED
];

/**
 * Type representing a descriptor containing info useful to render
 * a proximity presentation on screen and create the {@link AcceptedFields}
 */
export type ProximityDisclosure = {
  descriptor: ProximityDetails;
  isAuthenticated: boolean;
};

/**
 * Engagement mode used to (re)start the native proximity session. Mirrors
 * `ISO18013_5.EngagementMode` but is declared locally to keep the inferred
 * reducer types portable (the library type is only exposed via a deep path).
 */
export type ProximityEngagementMode = 'qrcode' | 'nfc';

/**
 * Retrieval method negotiated by the verifier. Mirrors
 * `ISO18013_5.RetrievalMethod`, declared locally for the same reason as
 * {@link ProximityEngagementMode}.
 */
export type ProximityRetrievalMethod = 'ble' | 'nfc';

/* State type definition for the proximity slice
 * qrCode - The qr code to be displayed for starting the proximity process
 * error - Cotains the error object if any error occurs during the proximity process
 * state - The state of the proximity process
 * engagementMode - The active engagement mode ('qrcode' or 'nfc'). Drives the
 *   native session configuration when (re)starting the engagement.
 * retrievalMethod - The retrieval method negotiated by the verifier for the
 *   current request ('ble' or 'nfc'), as reported by `onDocumentRequestReceived`.
 */
type ProximitySlice = {
  qrCode?: string;
  status: ProximityStatus;
  documentRequest?: ISO18013_5.VerifierRequest;
  proximityDisclosureDescriptor?: ProximityDisclosure;
  errorDetails?: string;
  engagementMode: ProximityEngagementMode;
  retrievalMethod?: ProximityRetrievalMethod;
  grantedConsentKey?: string;
  isConnected: boolean;
};

// Initial state for the proximity slice
const initialState: ProximitySlice = {
  qrCode: undefined,
  status: ProximityStatus.PROXIMITY_STATUS_STOPPED,
  errorDetails: undefined,
  documentRequest: undefined,
  proximityDisclosureDescriptor: undefined,
  engagementMode: 'qrcode',
  retrievalMethod: undefined,
  grantedConsentKey: undefined,
  isConnected: false
};

/**
 * Redux slice for the proximity state. It holds the status of flows related to the proximity process.
 */
const proximitySlice = createSlice({
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
      action: PayloadAction<ProximityDisclosure>
    ) => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED;
      state.proximityDisclosureDescriptor = action.payload;
    },
    setProximityStatusAuthorizationSend: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND;
    },
    /**
     * Moves the flow to the "store consent" step, used only by the NFC retrieval
     * dance to prompt the user whether to persist the granted consent. Drives
     * navigation to the store consent screen.
     */
    setProximityStoreConsentPrompt: state => {
      state.status = ProximityStatus.PROXIMITY_STATUS_STORE_CONSENT;
    },
    /**
     * Signals the user's choice on the store consent screen. Consumed by the
     * proximity middleware; it does not alter the slice state on its own.
     */
    setProximityStoreConsentChosen: (
      _state,
      _action: PayloadAction<{ store: boolean }>
    ) => {
      // no-op: the middleware reacts to this action
    },
    /**
     * Records, for the current session, the consent key the user has already
     * reviewed and identified for. Survives the engagement restart (which wipes
     * listener locals) so the re-engaged NFC session can skip the claims screen.
     */
    setProximityGrantedConsent: (state, action: PayloadAction<string>) => {
      state.grantedConsentKey = action.payload;
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
    /**
     * Sets the engagement mode used to (re)start the native session. Switching
     * to 'nfc' and re-dispatching {@link setProximityStatusStarted} restarts the
     * listener with the NFC configuration (handled by `takeLatestEffect`).
     */
    setProximityEngagementMode: (
      state,
      action: PayloadAction<ProximityEngagementMode>
    ) => {
      state.engagementMode = action.payload;
      // A fresh engagement (or a QR->NFC switch) starts with no session consent.
      // The NFC-retrieval re-engagement does not go through this action, so the
      // consent granted mid-flow is preserved across the restart.
      state.grantedConsentKey = undefined;
    },
    /**
     * Stores the retrieval method negotiated by the verifier for the current
     * request, as reported by the `onDocumentRequestReceived` native event.
     */
    setProximityRetrievalMethod: (
      state,
      action: PayloadAction<ProximityRetrievalMethod | undefined>
    ) => {
      state.retrievalMethod = action.payload;
    },
    setProximityIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    resetProximity: _ => initialState
  },
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
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
  setProximityStoreConsentPrompt,
  setProximityStoreConsentChosen,
  setProximityGrantedConsent,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationComplete,
  setProximityQrCode,
  resetProximityQrCode,
  setProximityEngagementMode,
  setProximityRetrievalMethod,
  setProximityIsConnected,
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
export const selectProximityQrCode = (state: WalletCombinedRootState) =>
  state.wallet.proximity.qrCode;

/**
 * Selects the proximity status
 * @param state - The root state
 * @returns The proximity status
 */
export const selectProximityStatus = (state: WalletCombinedRootState) =>
  state.wallet.proximity.status;

/**
 * Checks if the proximity middleware is in an error status
 * @param state - The root state
 * @returns true if the status is a failing one, false otherwise
 */
export const selectProximityFailure = (state: WalletCombinedRootState) =>
  PROXIMITY_FAILURE_STATUSES.includes(state.wallet.proximity.status);

/**
 * Selects the request sent by a Verifier App
 * @param state - The root state
 * @returns The request sent by the Verifier App
 */
export const selectProximityDocumentRequest = (
  state: WalletCombinedRootState
) => state.wallet.proximity.documentRequest;

/**
 * Selects the descriptor proccessed from the {@link VerifierRequest}
 * @param state - The root state
 * @returns A {@link ProximityDisclosureDescriptor}
 */
export const selectProximityDisclosureDescriptor = (
  state: WalletCombinedRootState
) => state.wallet.proximity.proximityDisclosureDescriptor?.descriptor;

/**
 * Selects the verifier authentication flags
 * @param state - The root state
 * @returns The verifier authentication flags
 */
export const selectProximityDisclosureIsAuthenticated = createSelector(
  (state: WalletCombinedRootState) =>
    state.wallet.proximity.proximityDisclosureDescriptor,
  descriptor => descriptor?.isAuthenticated || false
);

/**
 * Selects the error details
 * @param state - The root state
 * @returns The error details
 */
export const selectProximityErrorDetails = (state: WalletCombinedRootState) =>
  state.wallet.proximity.errorDetails;

/**
 * Selects the active engagement mode ('qrcode' or 'nfc')
 * @param state - The root state
 * @returns The active engagement mode
 */
export const selectProximityEngagementMode = (state: WalletCombinedRootState) =>
  state.wallet.proximity.engagementMode;

/**
 * Selects the retrieval method negotiated by the verifier for the current request
 * @param state - The root state
 * @returns The retrieval method ('ble' or 'nfc') if available, undefined otherwise
 */
export const selectProximityRetrievalMethod = (
  state: WalletCombinedRootState
) => state.wallet.proximity.retrievalMethod;

/**
 * Selects the consent key already granted (reviewed + identified) in the current
 * session, if any.
 * @param state - The root state
 * @returns The granted consent key, or undefined
 */
export const selectProximityGrantedConsentKey = (
  state: WalletCombinedRootState
) => state.wallet.proximity.grantedConsentKey;

/**
 * Selects whether or not the device is connected to another one
 */
export const selectProximityIsConnected = (state: WalletCombinedRootState) =>
  state.wallet.proximity.isConnected;
