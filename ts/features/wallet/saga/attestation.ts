import {call, select} from 'typed-redux-saga';
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

/**
 * Utility generator function to obtain a wallet attestation.
 * @param instanceKeyTag - the keytag bound to the wallet instance for which the attestation is requested.
 * @returns the attestation for the wallet instance.
 * @throws {@link Errors.WalletProviderResponseError} if the wallet provider returns an error.
 */
export function* getAttestation(instanceKeyTag: string) {
  const sessionId = yield* select(selectSessionId);
  const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
  const appFetch = createWalletProviderFetch(walletProviderBaseUrl, sessionId);

  const integrityContext = getIntegrityContext(instanceKeyTag);
  // generate Key for Wallet Instance Attestation
  // ensure the key esists befor starting the issuing process
  yield* call(regenerateCryptoKey, WIA_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  /**
   * Obtains a new Wallet Instance Attestation.
   * WARNING: The integrity context must be the same used when creating the Wallet Instance with the same keytag.
   */
  return yield* call(WalletInstanceAttestation.getAttestation, {
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl,
    appFetch
  });
}
