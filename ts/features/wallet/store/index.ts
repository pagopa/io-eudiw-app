import { combineReducers } from '@reduxjs/toolkit';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { attestationReducer, AttestationState } from './attestation';
import {
  credentialIssuanceStatusReducer,
  CredentialIssuanceStatusState
} from './credentialIssuance';
import { credentialsReducer, CredentialsState } from './credentials';
import { instanceReducer, InstanceState } from './instance';
import { lifecycleReducer, LifecycleState } from './lifecycle';
import {
  pidIssuanceStatusReducer,
  PidIssuanceStatusState
} from './pidIssuance';
import { PresentationState, presentationReducer } from './presentation';
import { proximityReducer, ProximityState } from './proximity';

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
