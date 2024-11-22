/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import {RootState} from '../../../store/types';
import secureStoragePersistor from '../../../store/persistors/secureStorage';

/* State type definition for the pin slice
 * pin - Application PIN set by the user
 */
export type AttestationState = {
  attestation: string | undefined;
};

// Initial state for the pin slice
const initialState: AttestationState = {
  attestation: undefined
};

/**
 * Redux slice for the pin state. It allows to set and reset the pin.
 * This must be a separate slice because the pin is sored using a custom persistor.
 */
const attestationSlice = createSlice({
  name: 'attestation',
  initialState,
  reducers: {
    setAttestation: (state, action: PayloadAction<string>) => {
      state.attestation = action.payload;
    },
    resetAttestation: () => initialState
  }
});

/**
 * Redux persist configuration for the pin slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const attestationPersist: PersistConfig<AttestationState> = {
  key: 'attestation',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the pin slice.
 */
export const attestationReducer = persistReducer(
  attestationPersist,
  attestationSlice.reducer
);

/**
 * Exports the actions for the pin slice.
 */
export const {setAttestation, resetAttestation} = attestationSlice.actions;

export const selectAttestation = (state: RootState) =>
  state.wallet.attestation.attestation;
