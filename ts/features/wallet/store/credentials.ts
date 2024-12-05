/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import secureStoragePersistor from '../../../store/persistors/secureStorage';
import {StoredCredential} from '../utils/types';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type CredentialsState = {
  pid: StoredCredential | undefined;
  credentials: Record<string, StoredCredential>;
};

// Initial state for the pin slice
const initialState: CredentialsState = {
  pid: undefined,
  credentials: {}
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    addPid: (state, action: PayloadAction<{pid: StoredCredential}>) => {
      state.pid = action.payload.pid;
    },
    addCredential: (
      state,
      action: PayloadAction<{credential: StoredCredential}>
    ) => {
      const {credential} = action.payload;
      state.credentials[credential.credentialType] = credential;
    },
    removeCredential: (
      state,
      action: PayloadAction<{credentialType: string}>
    ) => {
      const {credentialType} = action.payload;
      delete state.credentials[credentialType];
    },
    resetCredentials: () => initialState
  }
});

/**
 * Redux persist configuration for the pin slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const credentialsPersistor: PersistConfig<CredentialsState> = {
  key: 'attestation',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the pin slice.
 */
export const credentialsReducer = persistReducer(
  credentialsPersistor,
  credentialsSlice.reducer
);

/**
 * Exports the actions for the pin slice.
 */
export const {addPid, addCredential, removeCredential, resetCredentials} =
  credentialsSlice.actions;
