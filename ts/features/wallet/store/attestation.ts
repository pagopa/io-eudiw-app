/* eslint-disable functional/immutable-data */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import {RootState} from '../../../store/types';
import secureStoragePersistor from '../../../store/persistors/secureStorage';

/* State type definition for the attestation slice
 * attestation - The wallet instance attestation
 */
export type AttestationState = {
  attestation: string | undefined;
};

// Initial state for the attestation slice
const initialState: AttestationState = {
  attestation: undefined
};

/**
 * Redux slice for the attestation state. It allows to set and reset the attestation.
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
 * Redux persist configuration for the attestation slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const attestationPersist: PersistConfig<AttestationState> = {
  key: 'attestation',
  storage: secureStoragePersistor()
};

/**
 * Persisted reducer for the attestation slice.
 */
export const attestationReducer = persistReducer(
  attestationPersist,
  attestationSlice.reducer
);

/**
 * Exports the actions for the attestation slice.
 */
export const {setAttestation, resetAttestation} = attestationSlice.actions;

/**
 * Select the wallet instance attestation.
 * @param state - The root state
 * @returns the wallet instance attestation
 */
export const selectAttestation = (state: RootState) =>
  state.wallet.attestation.attestation;
