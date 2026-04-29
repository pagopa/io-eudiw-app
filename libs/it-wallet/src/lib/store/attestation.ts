import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { WalletCombinedRootState } from '.';
import { secureStoragePersistor } from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';

/* State type definition for the attestation slice
 * attestation - The wallet instance attestation
 */
type AttestationSlice = {
  attestation: string | undefined;
};

// Initial state for the attestation slice
export const initialState: AttestationSlice = {
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
    }
  },
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  }
});

/**
 * Redux persist configuration for the attestation slice.
 * Currently it uses `io-react-native-secure-storage` as the storage engine which stores it encrypted.
 */
const attestationPersist: PersistConfig<AttestationSlice> = {
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
export const { setAttestation } = attestationSlice.actions;

/**
 * Select the wallet instance attestation.
 * @param state - The root state
 * @returns the wallet instance attestation
 */
export const selectAttestation = (state: WalletCombinedRootState) =>
  state.wallet.attestation.attestation;
