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
import {preferencesReset} from '../../../store/reducers/preferences';
import {resetLifecycle} from './lifecycle';

type RequestedCredential = string | undefined;
type RequestedCredentialType = string | undefined;

type ObtainCredentialPreAuthResult = boolean;
// {
// This is commented because currently the getRequestedCredentialToBePresented function is not available for a generic credential
// requestObject: Awaited<
//   ReturnType<typeof Credential.Issuance.getRequestedCredentialToBePresented>
// >;
// codeVerifier: Awaited<
//   ReturnType<typeof Credential.Issuance.startUserAuthorization>
// >['codeVerifier'];
// credentialDefinition: Awaited<
//   ReturnType<typeof Credential.Issuance.startUserAuthorization>
// >['credentialDefinition'];
// clientId: Awaited<
//   ReturnType<typeof Credential.Issuance.startUserAuthorization>
// >['clientId'];
// issuerConf: Awaited<
//   ReturnType<typeof Credential.Issuance.getIssuerConfig>
// >['issuerConf'];
// redirectUri: string;
// credentialType: string;
// };

/* State type definition for the credentialIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the CREDENTIAL issuance
 */
export type CredentialIssuanceStatusState = {
  requestedCredential: RequestedCredential;
  requestedCredentialType: RequestedCredentialType;
  statusPreAuth: AsyncStatusValues<ObtainCredentialPreAuthResult>;
  statusPostAuth: AsyncStatusValues<StoredCredential>;
};

// Initial state for the credentialIssuance slice
const initialState: CredentialIssuanceStatusState = {
  requestedCredential: undefined,
  requestedCredentialType: undefined,
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
      state.statusPreAuth = setError(action.payload.error);
    },
    setCredentialIssuancePreAuthSuccess: (
      state,
      action: PayloadAction<{
        result: ObtainCredentialPreAuthResult;
        credentialType: RequestedCredentialType;
      }>
    ) => {
      state.statusPreAuth = setSuccess(action.payload.result);
      state.requestedCredentialType = action.payload.credentialType;
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
    },
    resetCredentialIssuance: _ => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
    // This happens when the wallet state is reset
    builder.addCase(resetLifecycle, _ => initialState);
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

export const selectRequestedCredentialType = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.requestedCredentialType;

export const selectCredentialIssuancePostAuthError = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.statusPostAuth.error.error;

export const selectCredentialIssuancePreAuthError = (state: RootState) =>
  state.wallet.credentialIssuanceStatus.statusPreAuth.error.error;
