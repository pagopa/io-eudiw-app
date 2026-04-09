import {
  combineReducers,
  ThunkAction,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import {
  attestationReducer,
  purgeAttestationPersistedState
} from './attestation';
import { credentialIssuanceStatusReducer } from './credentialIssuance';
import {
  credentialsReducer,
  purgeCredentialsPersistedState
} from './credentials';
import { instanceReducer, purgeInstancePersistedState } from './instance';
import {
  lifecycleReducer,
  purgeLifecyclePersistedState,
  resetLifecycle
} from './lifecycle';
import { pidIssuanceStatusReducer } from './pidIssuance';
import { presentationReducer } from './presentation';
import { proximityReducer } from './proximity';

// External State Types
import { DebugRootState } from '@io-eudiw-app/debug-info';
import {
  PreferenceRootState,
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';

/**
 * Purges all wallet persisted state from storage.
 * This should be called when the wallet state is reset
 * to ensure the persisted state is also cleared.
 */
export const purgeWalletPersistedState = () =>
  Promise.all([
    purgeInstancePersistedState(),
    purgeCredentialsPersistedState(),
    purgeLifecyclePersistedState(),
    purgeAttestationPersistedState()
  ]);

/**
 * Combine all slices into a single base reducer
 */
const combinedReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer,
  presentation: presentationReducer,
  proximity: proximityReducer
});

/**
 * Root Reducer with Global Reset Logic
 * We intercept 'preferencesReset' and 'preferencesSetIsFirstStartupFalse'. When these actions are dispatched,
 * we pass 'undefined' as the state to the combinedReducer.
 * This forces all slices to return to their initial state.
 */
export const walletRootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: UnknownAction
) => {
  if (
    action.type === resetLifecycle.type ||
    action.type === preferencesReset.type ||
    action.type === preferencesSetIsFirstStartupFalse.type
  ) {
    state = undefined;
  }
  return combinedReducer(state, action);
};

type WalletRootState = ReturnType<typeof combinedReducer>;

/**
 * This type is required for selectors and middleware in order to correctly type the state of the wallet submodule.
 * It combines the actual wallet state with some other states which this module depends on, otherwise the selectors and middleware won't be able
 * to correctly infer the type of the data returned by the state.
 */
export type WalletCombinedRootState = {
  wallet: WalletRootState;
} & DebugRootState &
  PreferenceRootState;

export type WalletDispatch = ThunkDispatch<
  WalletCombinedRootState,
  undefined,
  UnknownAction
>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  WalletCombinedRootState,
  unknown,
  UnknownAction
>;

/**
 * HOOKS
 */
export const useAppSelector = useSelector.withTypes<WalletCombinedRootState>();
export const useAppDispatch = useDispatch.withTypes<WalletDispatch>();
