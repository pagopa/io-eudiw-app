import { combineReducers } from '@reduxjs/toolkit';
import { attestationReducer } from './attestation';
import { credentialIssuanceStatusReducer } from './credentialIssuance';
import { credentialsReducer } from './credentials';
import { instanceReducer } from './instance';
import { lifecycleReducer } from './lifecycle';
import { pidIssuanceStatusReducer } from './pidIssuance';
import { presentationReducer } from './presentation';
import { proximityReducer } from './proximity';

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
