import {combineReducers} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersistPartial} from 'redux-persist/es/persistReducer';
import {lifecycleState, LifecycleState} from './lifecycle';
import {attestationReducer, AttestationState} from './attestation';
import {instanceSlice, InstanceState} from './instance';
import {pidIssuanceStatusSlice, PidIssuanceStatusState} from './pidIssuance';

export type WalletState = {
  lifecycle: LifecycleState;
  instance: InstanceState;
  attestation: AttestationState & PersistPartial;
  pidIssuanceStatus: PidIssuanceStatusState;
};

const walletReducer = combineReducers({
  lifecycle: lifecycleState.reducer,
  instance: instanceSlice.reducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusSlice.reducer
});

const itwPersistConfig: PersistConfig<WalletState> = {
  key: 'itWallet',
  storage: AsyncStorage,
  whitelist: ['lifecycle'] satisfies Array<keyof WalletState>
};

export const persistedReducer = persistReducer(itwPersistConfig, walletReducer);

export default persistedReducer;
