import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { WalletCombinedRootState } from '.';
import { ResolvedCredentialOffer } from '../types';
import {
  EnrichedPresentationDetails,
  StoredCredential
} from '../utils/itwTypesUtils';
import { resetLifecycle } from './lifecycle';

export type RequestedCredential = string | undefined;
/* State type definition for the credentialIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the CREDENTIAL issuance
 */
type CredentialIssuanceStatusSlice = {
  requestedCredential: RequestedCredential;
  /**
   * Issuer URL to use for the issuance. When set (e.g. coming from a credential
   * offer) it overrides the default EAA provider configured via env.
   */
  requestedCredentialIssuerUrl: string | undefined;
  /**
   * The resolved credential offer that originated the issuance, when the flow
   * was started from one. The issuance listener needs the whole offer (not just
   * the derived config id/issuer URL) to validate it and to forward the selected
   * `authorization_server` to the Issuer metadata discovery.
   */
  requestedCredentialOffer: ResolvedCredentialOffer | undefined;
  requestedCredentialType: RequestedCredentialType;
  statusPostAuth: AsyncStatusValues<StoredCredential>;
  statusPreAuth: AsyncStatusValues<ObtainCredentialPreAuthResult>;
};

type ObtainCredentialPreAuthResult = EnrichedPresentationDetails | undefined;

type RequestedCredentialType = string | undefined;

// Initial state for the credentialIssuance slice
const initialState: CredentialIssuanceStatusSlice = {
  requestedCredential: undefined,
  requestedCredentialIssuerUrl: undefined,
  requestedCredentialOffer: undefined,
  requestedCredentialType: undefined,
  statusPostAuth: setInitial(),
  statusPreAuth: setInitial()
};

/**
 * Redux slice for the credentialIssuance state. It holds the status of flows related to the CREDENTIAL issuance
 * allowing to handle the UI accordingly with a request, loading and success/error states along with their data, if necessary.
 */
const credentialIssuanceStatusSlice = createSlice({
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'credentialIssuanceStatus',
  reducers: {
    resetCredentialIssuance: _ => initialState,
    setCredentialIssuancePostAuthError: (
      state,
      action: PayloadAction<{ error: unknown }>
    ) => {
      state.statusPostAuth = setError(action.payload.error);
    },
    setCredentialIssuancePostAuthRequest: state => {
      state.statusPostAuth = setLoading();
    },
    setCredentialIssuancePostAuthSuccess: (
      state,
      action: PayloadAction<{ credential: StoredCredential }>
    ) => {
      state.statusPostAuth = setSuccess(action.payload.credential);
    },
    setCredentialIssuancePreAuthError: (
      state,
      action: PayloadAction<{ error: unknown }>
    ) => {
      state.statusPreAuth = setError(action.payload.error);
    },
    setCredentialIssuancePreAuthRequest: (
      state,
      action: PayloadAction<
        | { credential: RequestedCredential; issuerUrl?: string }
        | { offer: ResolvedCredentialOffer }
      >
    ) => {
      if ('offer' in action.payload) {
        // Issuance started from a credential offer: keep the whole offer around
        // and derive the credential config id and issuer URL from it.
        const { offer } = action.payload;
        state.requestedCredentialOffer = offer;
        state.requestedCredential = offer.credential_configuration_ids[0];
        state.requestedCredentialIssuerUrl = offer.credential_issuer;
      } else {
        state.requestedCredentialOffer = undefined;
        state.requestedCredential = action.payload.credential;
        state.requestedCredentialIssuerUrl = action.payload.issuerUrl;
      }
      state.statusPreAuth = setLoading();
    },
    setCredentialIssuancePreAuthSuccess: (
      state,
      action: PayloadAction<{
        credentialType: RequestedCredentialType;
        result: ObtainCredentialPreAuthResult;
      }>
    ) => {
      state.statusPreAuth = setSuccess(action.payload.result);
      state.requestedCredentialType = action.payload.credentialType;
    }
  }
});

/**
 * Exports the actions for the credentialIssuance slice.
 */
export const {
  resetCredentialIssuance,
  setCredentialIssuancePostAuthError,
  setCredentialIssuancePostAuthRequest,
  setCredentialIssuancePostAuthSuccess,
  setCredentialIssuancePreAuthError,
  setCredentialIssuancePreAuthRequest,
  setCredentialIssuancePreAuthSuccess
} = credentialIssuanceStatusSlice.actions;

/**
 * Exports the reducer for the credentialIssuance slice.
 */
export const { reducer: credentialIssuanceStatusReducer } =
  credentialIssuanceStatusSlice;

export const selectCredentialIssuancePreAuthStatus = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.statusPreAuth;

export const selectCredentialIssuancePostAuthStatus = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.statusPostAuth;

export const selectRequestedCredential = (state: WalletCombinedRootState) =>
  state.wallet.credentialIssuanceStatus.requestedCredential;

export const selectRequestedCredentialIssuerUrl = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.requestedCredentialIssuerUrl;

export const selectRequestedCredentialOffer = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.requestedCredentialOffer;

export const selectRequestedCredentialType = (state: WalletCombinedRootState) =>
  state.wallet.credentialIssuanceStatus.requestedCredentialType;

export const selectCredentialIssuancePostAuthError = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.statusPostAuth.error.error;

export const selectCredentialIssuancePreAuthError = (
  state: WalletCombinedRootState
) => state.wallet.credentialIssuanceStatus.statusPreAuth.error.error;
