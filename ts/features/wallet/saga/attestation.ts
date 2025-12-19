import Config from 'react-native-config';
import {
  createCryptoContextFor,
  WalletInstanceAttestation
} from '@pagopa/io-react-native-wallet';
import {regenerateCryptoKey} from '../../../utils/crypto';
import {WIA_KEYTAG} from '../utils/crypto';
import {getIntegrityContext} from '../utils/integrity';
import {createWalletProviderFetch} from '../utils/fetch';
import {selectSessionId} from '../../../store/reducers/preferences';
import {selectInstanceKeyTag} from '../store/instance';
import {selectAttestation, setAttestation} from '../store/attestation';
import {isWalletInstanceAttestationValid} from '../utils/attestation';
import {AppListener} from '../../../listener/listenerMiddleware';

/**
 * Helper function to handle startup actions. It ensures that the attestation is obtained when the app starts up.
 * @param _ - The dispatched action which triggered the listener
 * @param listenerApi - The listener API
 * @returns A promise that resolves when the attestation is obtained
 */
export const getAttestation = async (listenerApi: AppListener) => {
  const state = listenerApi.getState();
  const instanceKeyTag = selectInstanceKeyTag(state);
  if (!instanceKeyTag) {
    throw new Error('Instance key tag is not set. Cannot obtain attestation.');
  }
  // If we don't have an existing attestation or it's not valid, we need to generate a new one.
  const existingAttestation = selectAttestation(state);
  if (
    !existingAttestation ||
    !isWalletInstanceAttestationValid(existingAttestation)
  ) {
    const sessionId = selectSessionId(state);
    const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
    const appFetch = createWalletProviderFetch(
      walletProviderBaseUrl,
      sessionId
    );

    const integrityContext = getIntegrityContext(instanceKeyTag);
    // generate Key for Wallet Instance Attestation
    // ensure the key esists befor starting the issuing process
    await regenerateCryptoKey(WIA_KEYTAG);
    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

    /**
     * Obtains a new Wallet Instance Attestation.
     * WARNING: The integrity context must be the same used when creating the Wallet Instance with the same keytag.
     */
    const attestation = await WalletInstanceAttestation.getAttestation({
      wiaCryptoContext,
      integrityContext,
      walletProviderBaseUrl,
      appFetch
    });

    listenerApi.dispatch(setAttestation(attestation[0].wallet_attestation));
    return attestation[0].wallet_attestation;
  } else {
    return existingAttestation;
  }
};
