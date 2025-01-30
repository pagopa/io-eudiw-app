import {combineReducers} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersistPartial} from 'redux-persist/es/persistReducer';
import {lifecycleReducer, LifecycleState} from './lifecycle';
import {attestationReducer, AttestationState} from './attestation';
import {instanceReducer, InstanceState} from './instance';
import {pidIssuanceStatusReducer, PidIssuanceStatusState} from './pidIssuance';
import {credentialsReducer, CredentialsState} from './credentials';
import {PresentationState, presentationReducer} from './presentation';

export type WalletState = {
  lifecycle: LifecycleState;
  instance: InstanceState;
  attestation: AttestationState & PersistPartial;
  pidIssuanceStatus: PidIssuanceStatusState;
  credentials: CredentialsState & PersistPartial;
  presentation: PresentationState;
};

const walletReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  presentation: presentationReducer
});

const itwPersistConfig: PersistConfig<WalletState> = {
  key: 'itWallet',
  storage: AsyncStorage,
  whitelist: ['lifecycle'] satisfies Array<keyof WalletState>
};

export const persistedReducer = persistReducer(itwPersistConfig, walletReducer);

export default persistedReducer;
