import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import { WalletCombinedRootState } from '.';
import { secureStoragePersistor } from '@io-eudiw-app/commons';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from './lifecycle';
import { IoWallet } from '@pagopa/io-react-native-wallet';
import { WALLET_SPEC_VERSION } from '../utils/constants';

/* State type definition for the attestation slice
 * attestation - The wallet instance attestation
 */
type AttestationState = {
  wia: {
    value?: Record<string, string>;
  };
  wua: {
    value?: string;
  };
};

// Initial state for the attestation slice
export const initialState: AttestationState = {
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
  name: 'attestation133',
  initialState,
  reducers: {
    setWalletInstanceAttestation: (
      state,
      action: PayloadAction<Array<{ format: string; attestation: string }>>
    ) => {
      state.wia.value = action.payload.reduce(
        (acc, { format, attestation }) => ({ ...acc, [format]: attestation }),
        {} as Record<string, string>
      );
    },
    setWalletUnitAttestation: (state, action: PayloadAction<string>) => {
      state.wua.value = action.payload;
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
const attestationPersist: PersistConfig<AttestationState> = {
  key: 'attestation133',
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

/**
 * Selects the attestation from the attestation state in the given format.
 * @param format - The format of the attestation to select
 * @param state - The root state of the Redux store
 * @returns the attestation
 */
export const makeSelectWalletInstanceAttestation =
  (format: string) => (state: WalletCombinedRootState) =>
    state.wallet133.attestation.wia.value?.[format];

export const selectWalletInstanceAttestationAsJwt =
  makeSelectWalletInstanceAttestation('jwt');
export const selectWalletInstanceAttestationAsSdJwt =
  makeSelectWalletInstanceAttestation('dc+sd-jwt');
export const selectWalletInstanceAttestationAsMdoc =
  makeSelectWalletInstanceAttestation('mso_mdoc');

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param state - the root state of the Redux store
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const shouldRequestWalletInstanceAttestationSelector: (
  state: WalletCombinedRootState
) => boolean = createSelector(
  selectWalletInstanceAttestationAsJwt,
  (attestation): boolean => {
    if (!attestation) {
      return true;
    }
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const payload = wallet.WalletInstanceAttestation.decode(attestation);
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    return now > expiryDate;
  }
);
