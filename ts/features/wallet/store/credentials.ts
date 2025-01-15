/* eslint-disable functional/immutable-data */
import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import secureStoragePersistor from '../../../store/persistors/secureStorage';
import {StoredCredential} from '../utils/types';
import {RootState} from '../../../store/types';
import {preferencesReset} from '../../../store/reducers/preferences';

/* State type definition for the credentials slice.
 * This is stored as an array to avoid overhead due to map not being serializable,
 * thus needing to be converted to an array with a transformation.
 * pid - The PID credential
 * credentials - A map of all the stored credentials
 */
export type CredentialsState = {
  credentials: Array<StoredCredential>;
};

// Initial state for the credential slice
const initialState: CredentialsState = {
  credentials: []
};

/**
 * Redux slice for the credential state. It allows to store the PID and other credentials.
 * This must be a separate slice because the credentials are stored using a custom persistor.
 */
const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    addCredential: (
      state,
      action: PayloadAction<{credential: StoredCredential}>
    ) => {
      const {credential} = action.payload;
      const existingIndex = state.credentials.findIndex(
        c => c.credentialType === credential.credentialType
      );
      if (existingIndex !== -1) {
        // If the credential already exists, replace it
        state.credentials[existingIndex] = credential;
      } else {
        // Otherwise add it
        state.credentials.push(credential);
      }
    },
    // Empty action which will be intercepted by the saga and trigger the identification before storing the PID
    addCredentialWithIdentification: (
      _,
      __: PayloadAction<{credential: StoredCredential}>
    ) => {},
    removeCredential: (
      state,
      action: PayloadAction<{credentialType: string}>
    ) => {
      const {credentialType} = action.payload;
      state.credentials.filter(c => c.credentialType !== credentialType);
    },
    resetCredentials: () => initialState
  },
  extraReducers: builder => {
    // This happens when the whole app state is reset
    builder.addCase(preferencesReset, _ => initialState);
  }
});

/**
 * Redux persist configuration for the credential slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const credentialsPersistor: PersistConfig<CredentialsState> = {
  key: 'credentials',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the credential slice.
 */
export const credentialsReducer = persistReducer(
  credentialsPersistor,
  credentialsSlice.reducer
);

export const credentialsSelector = (state: RootState) =>
  state.wallet.credentials;

/**
 * Exports the actions for the credentials slice.
 */
export const {
  addCredential,
  removeCredential,
  addCredentialWithIdentification,
  resetCredentials
} = credentialsSlice.actions;

export const selectCredentials = (state: RootState) =>
  state.wallet.credentials.credentials;

export const selectCredential = (credentialType: string) =>
  createSelector(selectCredentials, credentials =>
    credentials.find(c => c.credentialType === credentialType)
  );
