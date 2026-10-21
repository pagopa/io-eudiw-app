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
import { PresentationPreDefinitionParams } from '../screens/presentation/PresentationPreDefinition';
import { FederationEntity } from '../types';
import { EnrichedPresentationDetails } from '../utils/itwTypesUtils';
import { resetLifecycle } from './lifecycle';

/**
 * Type for the description which contains the requested claims during the presentation.
 */
export type Descriptor = {
  descriptor: EnrichedPresentationDetails;
  rpConfig?: FederationEntity;
};

/**
 * Response type for the authorization request which is the final step of the presentation flow.
 */
type AuthResponse = {
  redirect_uri?: string;
};

/**
 * Type of the optional claims names selected by the user.
 */
type OptionalClaims = Descriptor['descriptor']; // The optional claims selected by the user

type PresentationErrors =
  | 'CREDENTIAL_NOT_FOUND'
  | 'PRESENTATION_ERROR'
  | 'WALLET_NOT_ACTIVE';

/* State type definition for the presentation slice
 * preDefinition - Async status for the prestation before receiving the descriptor
 * postDefinition - Async status for the presentation afetr receiving the descriptor
 * walletNotActive - True when presentation was attempted with a non-activated wallet
 */
type PresentationSlice = {
  credentialNotFound?: string;
  optionalCredentials?: string[];
  postDefinition: AsyncStatusValues<AuthResponse, PresentationErrors>;
  preDefinition: AsyncStatusValues<Descriptor, PresentationErrors>;
  relyingPartyData?: FederationEntity;
};

// Initial state for the presentation slice
const initialState: PresentationSlice = {
  credentialNotFound: undefined,
  optionalCredentials: [],
  postDefinition: setInitial(),
  preDefinition: setInitial()
};

/**
 * Redux slice for the presetation state. It holds the status of flows related to the presentation process.
 */
const presentationSlice = createSlice({
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'presentationSlice',
  reducers: {
    resetPresentation: state => {
      state.preDefinition = setInitial();
      state.postDefinition = setInitial();
      state.optionalCredentials = [];
      state.credentialNotFound = undefined;
    },
    setCredentialNotFound: (state, action: PayloadAction<string>) => {
      state.credentialNotFound = action.payload;
    },
    setOptionalCredentials: (state, action: PayloadAction<string[]>) => {
      state.optionalCredentials = [...new Set(action.payload)];
    },
    // Empty action which will be intercepted by the listener and trigger the identification before finishing the presentation process
    setPostDefinitionCancel: _ => {
      /* empty */
    },
    setPostDefinitionError: (
      state,
      action: PayloadAction<{ error: unknown; type?: PresentationErrors }>
    ) => {
      state.postDefinition = setError(
        action.payload.error,
        action.payload.type
      );
    },
    setPostDefinitionRequest: (state, _: PayloadAction<OptionalClaims[]>) => {
      /* Payload is not used but taken from the listener
       * The payload is an array of strings containing the optional claims selected by the user
       */
      state.postDefinition = setLoading();
    },
    setPostDefinitionSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.postDefinition = setSuccess(action.payload);
    },
    setPreDefinitionError: (
      state,
      action: PayloadAction<
        undefined | { error: unknown; type?: PresentationErrors }
      >
    ) => {
      state.preDefinition = setError(
        action.payload?.error,
        action.payload?.type
      );
    },
    setPreDefinitionRequest: (
      state,
      _: PayloadAction<PresentationPreDefinitionParams>
    ) => {
      state.preDefinition = setLoading();
    },
    setPreDefinitionSuccess: (state, action: PayloadAction<Descriptor>) => {
      state.preDefinition = setSuccess(action.payload);
    }
  }
});

/**
 * Exports the actions for the presentation slice.
 */
export const {
  resetPresentation,
  setCredentialNotFound,
  setOptionalCredentials,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionRequest,
  setPostDefinitionSuccess,
  setPreDefinitionError,
  setPreDefinitionRequest,
  setPreDefinitionSuccess
} = presentationSlice.actions;

/**
 * Exports the reducer for the presetation slice.
 */
export const { reducer: presentationReducer } = presentationSlice;

/**
 * Selects for the preDefinition status in the presentation slice, containg the
 * loading, error and success state.
 * @param state - The root state
 * @returns the preDefinition status object
 */
export const selectPreDefinitionStatus = (state: WalletCombinedRootState) =>
  state.wallet.presentation.preDefinition;

/**
 * Selects the result of the preDefinition process if it was successful.
 * @param state - The root state
 * @returns the descriptor containing the requested claims if the preDefinition was successful, undefined otherwise
 */
export const selectPreDefitionResult = (state: WalletCombinedRootState) =>
  state.wallet.presentation.preDefinition.success.status === true
    ? state.wallet.presentation.preDefinition.success.data
    : undefined;

/**
 * Selects for the postDefinition status in the presentation slice, containg the
 * loading, error and success state.
 * @param state - The root state
 * @returns the postDefinition status object
 */
export const selectPostDefinitionStatus = (state: WalletCombinedRootState) =>
  state.wallet.presentation.postDefinition;

/**
 * Selects the result of the postDefinition process if it was successful.
 * @param state - The root state
 * @returns the auth response containing if the postDefinition was successful, undefined otherwise
 */
export const selectPostDefinitionResult = (state: WalletCombinedRootState) =>
  state.wallet.presentation.postDefinition.success.status === true
    ? state.wallet.presentation.postDefinition.success.data
    : undefined;

/**
 * Selects the optional credentials selected by the user for the presentation process.
 * @param state - The root state
 * @returns an array of strings containing the names of the optional credentials selected by the user
 */
export const selectOptionalCredentials = (state: WalletCombinedRootState) =>
  state.wallet.presentation.optionalCredentials;

/**
 * Selects the credential configuration ID of the credential that was not found
 * during the DCQL presentation evaluation.
 * @param state - The root state
 * @returns the credential configuration ID if a credential was not found, undefined otherwise
 */
export const selectCredentialNotFound = (state: WalletCombinedRootState) =>
  state.wallet.presentation.credentialNotFound;
