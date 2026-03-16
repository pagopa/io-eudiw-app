import { combineReducers, ThunkAction, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { attestationReducer } from './attestation';
import { credentialIssuanceStatusReducer } from './credentialIssuance';
import { credentialsReducer } from './credentials';
import { instanceReducer } from './instance';
import { lifecycleReducer } from './lifecycle';
import { pidIssuanceStatusReducer } from './pidIssuance';
import { presentationReducer } from './presentation';
import { proximityReducer } from './proximity';
import { useDispatch, useSelector } from 'react-redux';
import { DebugRootState } from '@io-eudiw-app/debug-info';
import { PreferenceRootState } from '@io-eudiw-app/preferences';

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

export type WalletDispatch = ThunkDispatch<
  WalletCombinedRootState, 
  undefined,              
  UnknownAction          
>;

/**
 * This type is required for selectors and middleware in order to correctly type the state of the wallet submodule.
 * It combines the actual wallet state with some other states which this module depends on, otherwise the selectors and middleware won't be able 
 * to correctly infer the type of the data returned by the state.
 */
export type WalletCombinedRootState = {
  wallet: WalletRootState
} & DebugRootState & PreferenceRootState;


export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  WalletCombinedRootState,
  unknown,
  UnknownAction
>;

export const useAppSelector = useSelector.withTypes<WalletCombinedRootState>();

export const useAppDispatch = useDispatch.withTypes<WalletDispatch>();