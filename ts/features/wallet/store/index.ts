import {combineReducers} from '@reduxjs/toolkit';
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
import {PresentationState, presentationReducer} from './presentation';
import {proximityReducer, ProximityState} from './proximity';

export type WalletState = {
  lifecycle: LifecycleState & PersistPartial;
  instance: InstanceState & PersistPartial;
  attestation: AttestationState & PersistPartial;
  pidIssuanceStatus: PidIssuanceStatusState;
  credentials: CredentialsState & PersistPartial;
  credentialIssuanceStatus: CredentialIssuanceStatusState;
  presentation: PresentationState;
  proximity: ProximityState;
};

const walletReducer = combineReducers({
  lifecycle: lifecycleReducer,
  instance: instanceReducer,
  attestation: attestationReducer,
  pidIssuanceStatus: pidIssuanceStatusReducer,
  credentials: credentialsReducer,
  credentialIssuanceStatus: credentialIssuanceStatusReducer,
  presentation: presentationReducer,
  proximity: proximityReducer
});

export default walletReducer;
