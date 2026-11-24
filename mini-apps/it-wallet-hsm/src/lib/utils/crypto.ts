import type { LocalKeySigner, Signer } from '@pagopa/io-react-native-wallet';

import { getPublicKeyFixed, sign } from '@pagopa/io-react-native-crypto';
import { thumbprint } from '@pagopa/io-react-native-jwt';

import type { CredentialKey } from './itwTypesUtils';

import { requestRemotePin } from './pinPrompt';
import { createRemoteSignerFor } from './remoteCrypto';

/**
 * Constant for the keytag used for the WIA key.
 * It gets regenerated every time it's needed.
 */
export const WIA_KEYTAG = 'HSM_WIA_KEYTAG';

/**
 * Constant for the keytag used for the DPOP key.
 * It gets regenerated every time it's needed.
 */
export const DPOP_KEYTAG = 'HSM_DPOP_KEYTAG';

/**
 * Creates a local {@link LocalKeySigner} bound to a key pair stored in the device's keystore.
 * The key pair must already exist and is identified by its keytag.
 * @param keyTag - The keytag of the key pair
 * @returns the signer
 */
export const createLocalSignerFor = (keyTag: string): LocalKeySigner => ({
  async getPublicKey() {
    const jwk = await getPublicKeyFixed(keyTag);
    // Keys in the keystore are not stored with a KID, so the thumbprint of the public key is used.
    return { ...jwk, kid: await thumbprint(jwk) };
  },
  keyTag,
  kind: 'LOCAL',
  sign: (value: string) => sign(value, keyTag)
});

/**
 * Creates the {@link Signer} bound to a credential key.
 * Remote keys ask the user for the Remote WSCD PIN when the first signature is needed.
 * @param credentialKey - The key bound to the credential
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @returns the signer
 */
export const createCredentialSigner = (
  credentialKey: CredentialKey,
  xUserId: string
): Signer =>
  credentialKey.remoteKey !== undefined
    ? createRemoteSignerFor(
        credentialKey.remoteKey,
        () => requestRemotePin(),
        xUserId
      )
    : createLocalSignerFor(credentialKey.keyTag);
