/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Credential} from '@pagopa/io-react-native-wallet';
import {
  AsyncStatusValues,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';
import {RootState} from '../../../store/types';

export type Descriptor = Awaited<
  ReturnType<typeof Credential.Presentation.evaluateInputDescriptorForSdJwt4VC>
>;

export type AuthResponse = Awaited<
  ReturnType<typeof Credential.Presentation.sendAuthorizationResponse>
>;

/* State type definition for the pidIssuance slice
 * issuanceCreation - Async status for the instance creation
 * issuance - Async status for the PID issuance
 */
export type PresentationState = {
  preDefinition: AsyncStatusValues<Descriptor>;
  postDefinition: AsyncStatusValues<AuthResponse>;
};

// Initial state for the pidIssuance slice
const initialState: PresentationState = {
  preDefinition: setInitial(),
  postDefinition: setInitial()
};

/**
 * Redux slice for the pidIssuance state. It holds the status of flows related to the PID issuance
 * allowing to handle the UI accordingly with a request, loading and success/error states along with their data, if necessary.
 */
export const presentationSlice = createSlice({
  name: 'presentationSlice',
  initialState,
  reducers: {
    setPreDefinitionRequest: (state, _: PayloadAction<{url: string}>) => {
      state.preDefinition = setLoading();
    },
    setPreDefinitionError: (state, action: PayloadAction<{error: unknown}>) => {
      state.preDefinition = setError(action.payload.error);
    },
    setPreDefinitionSuccess: (state, action: PayloadAction<Descriptor>) => {
      state.preDefinition = setSuccess(action.payload);
    },
    resetPreDefinition: state => {
      state.preDefinition = setInitial();
    },
    setPostDefinitionRequest: state => {
      state.postDefinition = setLoading();
    },
    setPostDefinitionError: (
      state,
      action: PayloadAction<{error: unknown}>
    ) => {
      state.postDefinition = setError(action.payload.error);
    },
    setPostDefinitionSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.postDefinition = setSuccess(action.payload);
    },
    // Empty action which will be intercepted by the saga and trigger the identification before finishing the presentation process
    setPostDefinitionRequestWithAuth: _ => {},
    resetPresentation: state => {
      state.postDefinition = setInitial();
    }
  }
});

/**
 * Exports the actions for the pidIssuance slice.
 */
export const {
  setPreDefinitionRequest,
  setPreDefinitionError,
  setPreDefinitionSuccess,
  resetPreDefinition,
  setPostDefinitionRequest,
  setPostDefinitionError,
  setPostDefinitionSuccess,
  setPostDefinitionRequestWithAuth,
  resetPresentation
} = presentationSlice.actions;

/**
 * Exports the reducer for the pidIssuance slice.
 */
export const {reducer: presentationReducer} = presentationSlice;

export const selectPreDefinitionStatus = (state: RootState) =>
  state.wallet.presentation.preDefinition;

export const selectPreDefitionResult = (state: RootState) =>
  state.wallet.presentation.preDefinition.success.status === true
    ? state.wallet.presentation.preDefinition.success.data
    : undefined;

export const selectPostDefinitionStatus = (state: RootState) =>
  state.wallet.presentation.postDefinition;

export const selectPostDefinitionResult = (state: RootState) =>
  state.wallet.presentation.postDefinition.success.status === true
    ? state.wallet.presentation.postDefinition.success.data
    : undefined;
