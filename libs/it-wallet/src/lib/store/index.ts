import {
  combineReducers,
  ThunkAction,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { attestationReducer } from './attestation';
import { credentialIssuanceStatusReducer } from './credentialIssuance';
import { credentialsReducer } from './credentials';
import { instanceReducer } from './instance';
import { lifecycleReducer, resetLifecycle } from './lifecycle';
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
import { initialState as lifeCycleInitialState } from './lifecycle';
import { initialState as instanceInitialState } from './instance';
import { initialState as attestationInitialState } from './attestation';
import { initialState as credentialIssuanceInitialState } from './credentialIssuance';
import { initialState as credentialInitialState } from './credentials';
import { initialState as pidIssuanceInitialState } from './pidIssuance';
import { initialState as presentationInitialState } from './presentation';
import { initialState as proximityInitialState } from './proximity';

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
 * We intercept 'preferencesReset', 'preferencesSetIsFirstStartupFalse' and 'resetLifecycle'.
 * When these actions are dispatched this forces all slices to return to their initial state.
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
    state = state
      ? {
          lifecycle: {
            ...lifeCycleInitialState,
            _persist: state.lifecycle._persist
          },
          instance: {
            ...instanceInitialState,
            _persist: state.instance._persist
          },
          attestation: {
            ...attestationInitialState,
            _persist: state.attestation._persist
          },
          credentialIssuanceStatus: credentialIssuanceInitialState,
          credentials: {
            ...credentialInitialState,
            _persist: state.credentials._persist
          },
          pidIssuanceStatus: pidIssuanceInitialState,
          presentation: presentationInitialState,
          proximity: proximityInitialState
        }
      : state;
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
