import { secureStoragePersistor } from '@io-eudiw-app/commons';
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
import { PersistConfig, persistReducer } from 'redux-persist';

import { getWalletInstanceAttestationThunk } from '../middleware/attestation';
import { resetLifecycle } from './lifecycle';

/* State type definition for the attestation slice
 * attestation - The wallet instance attestation
 */
type AttestationState = {
  request: AsyncStatusValues;
  wia: {
    value?: Record<string, string>;
  };
  wua: {
    value?: string;
  };
};

// Initial state for the attestation slice
export const initialState: AttestationState = {
  request: setInitial(),
  wia: {
    value: undefined
  },
  wua: {
    value: undefined
  }
};

/**
 * Redux slice for the attestation state. It allows to set and reset the attestation.
 */
const attestationSlice = createSlice({
  extraReducers: builder => {
    builder.addCase(getWalletInstanceAttestationThunk.pending, state => {
      state.request = setLoading();
    });
    builder.addCase(getWalletInstanceAttestationThunk.fulfilled, state => {
      state.request = setSuccess();
    });
    builder.addCase(
      getWalletInstanceAttestationThunk.rejected,
      (state, action) => {
        state.request = setError(action.payload ?? action.error);
      }
    );
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'attestation',
  reducers: {
    setWalletInstanceAttestation: (
      state,
      action: PayloadAction<{ attestation: string; format: string }[]>
    ) => {
      state.wia.value = action.payload.reduce(
        (acc, { attestation, format }) => ({ ...acc, [format]: attestation }),
        {} as Record<string, string>
      );
    },
    setWalletUnitAttestation: (state, action: PayloadAction<string>) => {
      state.wua.value = action.payload;
    }
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
export const { setWalletInstanceAttestation, setWalletUnitAttestation } =
  attestationSlice.actions;
