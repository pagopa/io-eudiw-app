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
import { PreferencesPartialRootState } from '@io-eudiw-app/common-store';
import { DebugPartialRootState } from '@io-eudiw-app/debug-info';

export const walletReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer,
  presentation: presentationReducer,
  proximity: proximityReducer
});

export type WalletState = ReturnType<typeof walletReducer>;

export type WalletDispatch = ThunkDispatch<
  WalletPartialRootState, 
  undefined,              
  UnknownAction          
>;

export type WalletPartialRootState = {
  wallet: WalletState;
} & PreferencesPartialRootState & DebugPartialRootState;


export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  WalletPartialRootState,
  unknown,
  UnknownAction
>;

export const useAppSelector = useSelector.withTypes<WalletPartialRootState>();

export const useAppDispatch = useDispatch.withTypes<WalletDispatch>();