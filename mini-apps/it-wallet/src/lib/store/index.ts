// External State Types
import { DebugRootState } from '@io-eudiw-app/debug-info';
import { DeepLinkingRootState } from '@io-eudiw-app/navigation';
import { PreferenceRootState } from '@io-eudiw-app/preferences';
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
import { proximityConsentsReducer } from './proximityConsents';

/**
 * Combine all slices into a single base reducer.
 * Each slice handles its own reset logic via extraReducers.
 */
export const walletRootReducer = combineReducers({
  attestation: attestationReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer,
  credentials: credentialsReducer,
  instance: instanceReducer,
  lifecycle: lifecycleReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  presentation: presentationReducer,
  proximity: proximityReducer,
  proximityConsents: proximityConsentsReducer
});

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  WalletCombinedRootState,
  unknown,
  UnknownAction
>;

/**
 * This type is required for selectors and middleware in order to correctly type the state of the wallet submodule.
 * It combines the actual wallet state with some other states which this module depends on, otherwise the selectors and middleware won't be able
 * to correctly infer the type of the data returned by the state.
 */
export type WalletCombinedRootState = DebugRootState &
  DeepLinkingRootState &
  PreferenceRootState & {
    wallet: WalletRootState;
  };

export type WalletDispatch = ThunkDispatch<
  WalletCombinedRootState,
  undefined,
  UnknownAction
>;

type WalletRootState = ReturnType<typeof walletRootReducer>;

/**
 * HOOKS
 */
export const useAppSelector = useSelector.withTypes<WalletCombinedRootState>();
export const useAppDispatch = useDispatch.withTypes<WalletDispatch>();
