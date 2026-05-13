import type { AuthorizationContext } from './lib/utils/auth';
import { fixBase64EncodingOnKey } from './lib/utils/jwk';
// polyfill due to known bugs on URL implementation for react native
// https://github.com/facebook/react-native/issues/24428
import 'react-native-url-polyfill/auto';

import * as Trust from './lib/trust';
import * as CredentialsCatalogue from './lib/credentials-catalogue';
import * as CredentialIssuance from './lib/credential/issuance';
import * as CredentialOffer from './lib/credential/offer';
import * as CredentialStatus from './lib/credential/status';
import * as RemotePresentation from './lib/credential/presentation';
import * as Trustmark from './lib/credential/trustmark';
import * as SdJwt from './lib/sd-jwt';
import * as Mdoc from './lib/mdoc';
import * as Errors from './lib/utils/errors';
import * as WalletInstanceAttestation from './lib/wallet-instance-attestation';
import * as WalletUnitAttestation from './lib/wallet-unit-attestation';
import * as WalletInstance from './lib/wallet-instance';
import * as Logging from './lib/utils/logging';
import { AuthorizationDetail, AuthorizationDetails } from './lib/utils/par';
import {
  createCryptoContextFor,
  type KeyAttestationCryptoContext
} from './lib/utils/crypto';
import type { IntegrityContext } from './lib/utils/integrity';

export {
  Trust,
  CredentialIssuance,
  CredentialOffer,
  CredentialsCatalogue,
  CredentialStatus,
  RemotePresentation,
  SdJwt,
  Mdoc,
  WalletInstanceAttestation,
  WalletUnitAttestation,
  WalletInstance,
  Trustmark,
  Errors,
  createCryptoContextFor,
  AuthorizationDetail,
  AuthorizationDetails,
  fixBase64EncodingOnKey,
  Logging
};

export type {
  IntegrityContext,
  AuthorizationContext,
  KeyAttestationCryptoContext
};

export type * from './lib/api';

// Export SDK entrypoint
export { IoWallet } from './lib/IoWallet';
