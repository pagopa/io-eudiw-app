import {combineReducers} from '@reduxjs/toolkit';
import {PersistConfig, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersistPartial} from 'redux-persist/es/persistReducer';
import {lifecycleReducer, LifecycleState} from './lifecycle';
import {attestationReducer, AttestationState} from './attestation';
import {instanceReducer, InstanceState} from './instance';
import {pidIssuanceStatusReducer, PidIssuanceStatusState} from './pidIssuance';
import {credentialsReducer, CredentialsState} from './credentials';
import {
  credentialIssuanceStatusReducer,
  CredentialIssuanceStatusState
} from './credentialIssuance';

export type WalletState = {
  lifecycle: LifecycleState;
  instance: InstanceState;
  attestation: AttestationState & PersistPartial;
  pidIssuanceStatus: PidIssuanceStatusState;
  credentials: CredentialsState & PersistPartial;
  credentialIssuanceStatus: CredentialIssuanceStatusState;
};

const walletReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer
});

const itwPersistConfig: PersistConfig<WalletState> = {
  key: 'itWallet',
  storage: AsyncStorage,
  whitelist: ['lifecycle'] satisfies Array<keyof WalletState>
};

export const persistedReducer = persistReducer(itwPersistConfig, walletReducer);

export default persistedReducer;
