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
import { lifecycleReducer } from './lifecycle';
import { pidIssuanceStatusReducer } from './pidIssuance';
import { presentationReducer } from './presentation';
import { proximityReducer } from './proximity';

// External State Types
import { DebugRootState } from '@io-eudiw-app/debug-info';
import { PreferenceRootState } from '@io-eudiw-app/preferences';

/**
 * Combine all slices into a single base reducer.
 * Each slice handles its own reset logic via extraReducers.
 */
export const walletRootReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer,
  presentation: presentationReducer,
  proximity: proximityReducer
});

type WalletRootState = ReturnType<typeof walletRootReducer>;

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
