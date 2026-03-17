import { Credential } from '@pagopa/io-react-native-wallet';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PresentationPreDefinitionParams } from '../screens/presentation/PresentationPreDefinition';
import { FederationEntity } from '../types';
import { EnrichedPresentationDetails } from '../utils/itwTypesUtils';
import { resetLifecycle } from './lifecycle';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '@io-eudiw-app/commons';
import { WalletCombinedRootState } from '.';

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
type AuthResponse = Awaited<
  ReturnType<typeof Credential.Presentation.sendAuthorizationResponse>
>;

/**
 * Type of the optional claims names selected by the user.
 */
type OptionalClaims = Descriptor['descriptor']; // The optional claims selected by the user

/* State type definition for the presentation slice
 * preDefinition - Async status for the prestation before receiving the descriptor
 * postDefinition - Async status for the presentation afetr receiving the descriptor
 */
type PresentationSlice = {
  preDefinition: AsyncStatusValues<Descriptor>;
  postDefinition: AsyncStatusValues<AuthResponse>;
  relyingPartyData?: FederationEntity;
  optionalCredentials?: Array<string>;
};

// Initial state for the presentation slice
const initialState: PresentationSlice = {
  preDefinition: setInitial(),
  postDefinition: setInitial(),
  optionalCredentials: []
};

/**
 * Redux slice for the presetation state. It holds the status of flows related to the presentation process.
 */
const presentationSlice = createSlice({
  name: 'presentationSlice',
  initialState,
  reducers: {
    setPreDefinitionRequest: (
      state,
      _: PayloadAction<PresentationPreDefinitionParams>
    ) => {
      state.preDefinition = setLoading();
    },
    setPreDefinitionError: (
      state,
      action: PayloadAction<{ error: unknown }>
    ) => {
      state.preDefinition = setError(action.payload.error);
    },
    setPreDefinitionSuccess: (state, action: PayloadAction<Descriptor>) => {
      state.preDefinition = setSuccess(action.payload);
    },
    setPostDefinitionRequest: (
      state,
      _: PayloadAction<Array<OptionalClaims>>
    ) => {
      /* Payload is not used but taken from the listener
       * The payload is an array of strings containing the optional claims selected by the user
       */
      state.postDefinition = setLoading();
    },
    // Empty action which will be intercepted by the listener and trigger the identification before finishing the presentation process
    setPostDefinitionCancel: _ => {
      /* empty */
    },
    setPostDefinitionError: (
      state,
      action: PayloadAction<{ error: unknown }>
    ) => {
      state.postDefinition = setError(action.payload.error);
    },
    setPostDefinitionSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.postDefinition = setSuccess(action.payload);
    },
    setOptionalCredentials: (state, action: PayloadAction<Array<string>>) => {
      state.optionalCredentials = [...new Set(action.payload)];
    },
    resetPresentation: state => {
      state.preDefinition = setInitial();
      state.postDefinition = setInitial();
      state.optionalCredentials = [];
    }
  },
  extraReducers: builder => {
    // This happens when the wallet state is reset
    builder.addCase(resetLifecycle, _ => initialState);
  }
});

/**
 * Exports the actions for the presentation slice.
 */
export const {
  setPreDefinitionRequest,
  setPreDefinitionError,
  setPreDefinitionSuccess,
  setPostDefinitionRequest,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionSuccess,
  setOptionalCredentials,
  resetPresentation
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
