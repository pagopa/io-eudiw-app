import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Crypto from 'expo-crypto';
import { PersistConfig, persistReducer } from 'redux-persist';

import { WalletCombinedRootState } from '.';
import { resetLifecycle } from './lifecycle';

/* State type definition for the instance slice
 * keyTag - The keytag bound to the wallet instance
 * lockedKeyTag - The keytag of the wallet instance whose Remote WSCD keys have been locked by too many wrong passwords
 * hsmPasswordRemainingAttempts - The attempts left to enter the IT-Wallet password before the Remote WSCD keys get locked, if any was wrong
 */
type InstanceSlice = {
  hsmPasswordRemainingAttempts?: number;
  keyTag: string | undefined;
  lockedKeyTag?: string;
  sessionId: string;
};

/** The attempts to enter the IT-Wallet password allowed by the Wallet Provider. */
export const HSM_PASSWORD_MAX_ATTEMPTS = 3;

// Initial state for the instance slice
const initialState: InstanceSlice = {
  hsmPasswordRemainingAttempts: undefined,
  keyTag: undefined,
  lockedKeyTag: undefined,
  sessionId: Crypto.randomUUID().toString()
};

/**
 * Redux slice for the instance state. It allows to store and reset the keytag bound to the wallet instance.
 */
const instanceSlice = createSlice({
  extraReducers: builder => {
    // Reset the state when the preferences are reset, if it's the first startup or if the wallet lifecycle is reset. This is required to clear the persisted storage.
    builder.addCase(preferencesReset, () => initialState);
    builder.addCase(resetLifecycle, () => initialState);
    builder.addCase(preferencesSetIsFirstStartupFalse, () => initialState);
  },
  initialState,
  name: 'hsm/instance',
  reducers: {
    // Clears the lock once the PID is bound to a key of a new wallet instance
    resetRemoteKeyLock: state => {
      state.lockedKeyTag = undefined;
      state.hsmPasswordRemainingAttempts = undefined;
    },
    // The attempts are shared by every Remote WSCD key of the wallet instance, `undefined` resets them
    setHsmPasswordRemainingAttempts: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.hsmPasswordRemainingAttempts = action.payload;
    },
    setInstanceKeyTag: (state, action: PayloadAction<string>) => {
      state.keyTag = action.payload;
    },
    // The Wallet Provider locks every Remote WSCD key of the wallet instance after too many wrong passwords
    setRemoteKeyLocked: state => {
      state.lockedKeyTag = state.keyTag;
      state.hsmPasswordRemainingAttempts = 0;
    }
  }
});

/**
 * Redux persist configuration for the instance slice.
 * Currently it uses AsyncStorage as the storage engine.
 */
const instancePersist: PersistConfig<InstanceSlice> = {
  key: 'hsm_instance',
  storage: AsyncStorage
};

/**
 * Persisted reducer for the instance slice.
 */
export const instanceReducer = persistReducer(
  instancePersist,
  instanceSlice.reducer
);

/**
 * Exports the actions for the instance slice.
 */
export const {
  resetRemoteKeyLock,
  setHsmPasswordRemainingAttempts,
  setInstanceKeyTag,
  setRemoteKeyLocked
} = instanceSlice.actions;

/**
 * Select the wallet instance keytag.
 * @param state - The root state
 * @returns the wallet instance keytag
 */
export const selectInstanceKeyTag = (state: WalletCombinedRootState) =>
  state.hsm.instance.keyTag;

/**
 * Selects the session id of the wallet
 * @param state - The root state of the Redux store
 * @returns a randomly generated uuid
 */
export const selectSessionId = (state: WalletCombinedRootState) =>
  state.hsm.instance.sessionId;

/**
 * Whether the Remote WSCD keys, thus the PID, are locked because of too many wrong IT-Wallet passwords.
 * @param state - The root state
 * @returns true if the keys are locked until the identity is confirmed again
 */
export const selectIsRemoteKeyLocked = (state: WalletCombinedRootState) =>
  state.hsm.instance.lockedKeyTag !== undefined;

/**
 * Whether the current wallet instance is locked, thus a new one must be created to enroll new Remote WSCD keys.
 * @param state - The root state
 * @returns true if the current wallet instance is locked
 */
export const selectIsInstanceLocked = (state: WalletCombinedRootState) =>
  state.hsm.instance.lockedKeyTag !== undefined &&
  state.hsm.instance.lockedKeyTag === state.hsm.instance.keyTag;

/**
 * Selects the attempts left to enter the IT-Wallet password.
 * @param state - The root state
 * @returns the remaining attempts
 */
export const selectHsmPasswordRemainingAttempts = (
  state: WalletCombinedRootState
) =>
  state.hsm.instance.hsmPasswordRemainingAttempts ?? HSM_PASSWORD_MAX_ATTEMPTS;
