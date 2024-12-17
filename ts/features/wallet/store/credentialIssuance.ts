/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Credential} from '@pagopa/io-react-native-wallet';
import {RootState} from '../../../store/types';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';
import {StoredCredential} from '../utils/types';

type RequestedCredential = string | undefined;

type ObtainCredentialPreAuthResult = {
  requestObject: Awaited<
    ReturnType<typeof Credential.Issuance.getRequestedCredentialToBePresented>
  >;
  codeVerifier: Awaited<
    ReturnType<typeof Credential.Issuance.startUserAuthorization>
  >['codeVerifier'];
  credentialDefinition: Awaited<
    ReturnType<typeof Credential.Issuance.startUserAuthorization>
  >['credentialDefinition'];
  clientId: Awaited<
    ReturnType<typeof Credential.Issuance.startUserAuthorization>
  >['clientId'];
  issuerConf: Awaited<
    ReturnType<typeof Credential.Issuance.evaluateIssuerTrust>
  >['issuerConf'];
  redirectUri: string;
  credentialType: string;
};

/* State type definition for the credentialIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the CREDENTIAL issuance
 */
export type CredentialIssuanceStatusState = {
  requestedCredential: RequestedCredential;
  statusPreAuth: AsyncStatusValues<ObtainCredentialPreAuthResult>;
  statusPostAuth: AsyncStatusValues<StoredCredential>;
};

// Initial state for the credentialIssuance slice
const initialState: CredentialIssuanceStatusState = {
  requestedCredential: undefined,
  statusPreAuth: setInitial(),
  statusPostAuth: setInitial()
};

/**
 * Redux slice for the credentialIssuance state. It holds the status of flows related to the CREDENTIAL issuance
 * allowing to handle the UI accordingly with a request, loading and success/error states along with their data, if necessary.
 */
export const credentialIssuanceStatusSlice = createSlice({
  name: 'credentialIssuanceStatus',
  initialState,
  reducers: {
    setCredentialIssuancePreAuthRequest: (
      state,
      action: PayloadAction<{credential: RequestedCredential}>
    ) => {
      state.requestedCredential = action.payload.credential;
      state.statusPreAuth = setLoading();
    },
    setCredentialIssuancePreAuthError: (
      state,
      action: PayloadAction<{error: unknown}>
    ) => {
      state.requestedCredential = undefined;
      state.statusPreAuth = setError(action.payload.error);
    },
    setCredentialIssuancePreAuthSuccess: (
      state,
      action: PayloadAction<{result: ObtainCredentialPreAuthResult}>
    ) => {
      state.requestedCredential = undefined;
      state.statusPreAuth = setSuccess(action.payload.result);
    },
    setCredentialIssuancePostAuthRequest: state => {
      state.statusPostAuth = setLoading();
    },
    setCredentialIssuancePostAuthError: (
      state,
      action: PayloadAction<{error: unknown}>
    ) => {
      state.statusPostAuth = setError(action.payload.error);
    },
    setCredentialIssuancePostAuthSuccess: (
      state,
      action: PayloadAction<{credential: StoredCredential}>
    ) => {
      state.statusPostAuth = setSuccess(action.payload.credential);
      state.requestedCredential = undefined;
    },
    resetCredentialIssuance: _ => initialState
  }
});

/**
 * Exports the actions for the credentialIssuance slice.
 */
export const {
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthRequest,
  setCredentialIssuancePostAuthSuccess,
  setCredentialIssuancePreAuthError,
  setCredentialIssuancePreAuthRequest,
  setCredentialIssuancePreAuthSuccess,
  resetCredentialIssuance
} = credentialIssuanceStatusSlice.actions;

/**
 * Exports the reducer for the credentialIssuance slice.
 */
export const {reducer: credentialIssuanceStatusReducer} =
  credentialIssuanceStatusSlice;

export const selectCredentialIssuancePreAuthStatus = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.statusPreAuth;

export const selectCredentialIssuancePostAuthStatus = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.statusPostAuth;

export const selectRequestedCredential = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.requestedCredential;
