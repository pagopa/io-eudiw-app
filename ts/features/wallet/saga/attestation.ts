import {
  createCryptoContextFor,
  WalletInstanceAttestation
} from '@pagopa/io-react-native-wallet';
import { call, put, select } from 'typed-redux-saga';
import { getEnv } from '../../../../ts/config/env';
import { selectSessionId } from '../../../store/reducers/preferences';
import { regenerateCryptoKey } from '../../../utils/crypto';
import { selectAttestation, setAttestation } from '../store/attestation';
import { selectInstanceKeyTag } from '../store/instance';
import { isWalletInstanceAttestationValid } from '../utils/attestation';
import { WIA_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { getIntegrityContext } from '../utils/integrity';

/**
 * Utility generator function to obtain a wallet attestation and set it in the store.
 * @returns the existing or newly generated Wallet Instance Attestation.
 */
export function* getAttestation() {
  const instanceKeyTag = yield* select(selectInstanceKeyTag);
  if (!instanceKeyTag) {
    throw new Error('Instance key tag is not set. Cannot obtain attestation.');
  }
  // If we don't have an existing attestation or it's not valid, we need to generate a new one.
  const existingAttestation = yield* select(selectAttestation);
  if (
    !existingAttestation ||
    !isWalletInstanceAttestationValid(existingAttestation)
  ) {
    const sessionId = yield* select(selectSessionId);
    const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
      getEnv();
    const appFetch = createWalletProviderFetch(
      walletProviderBaseUrl,
      sessionId
    );

    const integrityContext = getIntegrityContext(instanceKeyTag);
    // generate Key for Wallet Instance Attestation
    // ensure the key esists befor starting the issuing process
    yield* call(regenerateCryptoKey, WIA_KEYTAG);
    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    /**
     * Obtains a new Wallet Instance Attestation.
     * WARNING: The integrity context must be the same used when creating the Wallet Instance with the same keytag.
     */
    const attestation = yield* call(WalletInstanceAttestation.getAttestation, {
      wiaCryptoContext,
      integrityContext,
      walletProviderBaseUrl,
      appFetch
    });

    // # TODO: WLEO-727 - rework to support multiple attestations issuance
    yield* put(setAttestation(attestation[0].wallet_attestation));
    return attestation[0].wallet_attestation;
  } else {
    return existingAttestation;
  }
}
