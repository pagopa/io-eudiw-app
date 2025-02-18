/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Credential} from '@pagopa/io-react-native-wallet';
import {
  AsyncStatusValues,
  setCancel,
  setError,
  setInitial,
  setLoading,
  setSuccess
} from '../../../store/utils/asyncStatus';
import {RootState} from '../../../store/types';

/**
 * Parameters to start a presentation flow.
 */
export type PresentationParams = {
  request_uri: string;
  client_id: string;
};

/**
 * Type for the description which contains the requested claims during the presentation.
 */
export type Descriptor = Awaited<
  ReturnType<typeof Credential.Presentation.evaluateInputDescriptorForSdJwt4VC>
>;

/**
 * Response type for the authorization request which is the final step of the presentation flow.
 */
export type AuthResponse = Awaited<
  ReturnType<typeof Credential.Presentation.sendAuthorizationResponse>
>;

/**
 * Type of the optional claims names selected by the user.
 */
export type OptionalClaimsNames =
  Descriptor['optionalDisclosures'][0]['decoded'][1]; // Name of the optional claims selected by the user

/* State type definition for the presentation slice
 * preDefinition - Async status for the prestation before receiving the descriptor
 * postDefinition - Async status for the presentation afetr receiving the descriptor
 */
export type PresentationState = {
  preDefinition: AsyncStatusValues<Descriptor>;
  postDefinition: AsyncStatusValues<AuthResponse>;
};

// Initial state for the presentation slice
const initialState: PresentationState = {
  preDefinition: setInitial(),
  postDefinition: setInitial()
};

/**
 * Redux slice for the presetation state. It holds the status of flows related to the presentation process.
 */
export const presentationSlice = createSlice({
  name: 'presentationSlice',
  initialState,
  reducers: {
    setPreDefinitionRequest: (state, _: PayloadAction<PresentationParams>) => {
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
    setPostDefinitionRequest: (
      state,
      _: PayloadAction<Array<OptionalClaimsNames>>
    ) => {
      /* Payload is not used but taken from the saga
       * The payload is an array of strings containing the optional claims selected by the user
       */
      state.postDefinition = setLoading();
    },
    setPostDefinitionCancel: state => {
      state.postDefinition = setCancel();
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
      state.preDefinition = setInitial();
      state.postDefinition = setInitial();
    }
  }
});

/**
 * Exports the actions for the presentation slice.
 */
export const {
  setPreDefinitionRequest,
  setPreDefinitionError,
  setPreDefinitionSuccess,
  resetPreDefinition,
  setPostDefinitionRequest,
  setPostDefinitionCancel,
  setPostDefinitionError,
  setPostDefinitionSuccess,
  setPostDefinitionRequestWithAuth,
  resetPresentation
} = presentationSlice.actions;

/**
 * Exports the reducer for the presetation slice.
 */
export const {reducer: presentationReducer} = presentationSlice;

/**
 * Selects for the preDefinition status in the presentation slice, containg the
 * loading, error and success state.
 * @param state - The root state
 * @returns the preDefinition status object
 */
export const selectPreDefinitionStatus = (state: RootState) =>
  state.wallet.presentation.preDefinition;

/**
 * Selects the result of the preDefinition process if it was successful.
 * @param state - The root state
 * @returns the descriptor containing the requested claims if the preDefinition was successful, undefined otherwise
 */
export const selectPreDefitionResult = (state: RootState) =>
  state.wallet.presentation.preDefinition.success.status === true
    ? state.wallet.presentation.preDefinition.success.data
    : undefined;

/**
 * Selects for the postDefinition status in the presentation slice, containg the
 * loading, error and success state.
 * @param state - The root state
 * @returns the postDefinition status object
 */
export const selectPostDefinitionStatus = (state: RootState) =>
  state.wallet.presentation.postDefinition;

/**
 * Selects the result of the postDefinition process if it was successful.
 * @param state - The root state
 * @returns the auth response containing if the postDefinition was successful, undefined otherwise
 */
export const selectPostDefinitionResult = (state: RootState) =>
  state.wallet.presentation.postDefinition.success.status === true
    ? state.wallet.presentation.postDefinition.success.data
    : undefined;
