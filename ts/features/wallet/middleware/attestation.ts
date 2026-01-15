import Config from 'react-native-config';
import {
  createCryptoContextFor,
  WalletInstanceAttestation
} from '@pagopa/io-react-native-wallet';
import { selectSessionId } from '../../../store/reducers/preferences';
import { AppThunk } from '../../../store/types';
import { selectAttestation, setAttestation } from '../store/attestation';
import { selectInstanceKeyTag } from '../store/instance';
import { isWalletInstanceAttestationValid } from '../utils/attestation';
import { createWalletProviderFetch } from '../utils/fetch';
import { getIntegrityContext } from '../utils/integrity';
import { WIA_KEYTAG } from '../utils/crypto';
import { regenerateCryptoKey } from '../../../utils/crypto';

/**
 * Thunk to obtain the wallet instance attestation.
 * It requests the attestation if not in the store or if it's invalid.
 * It sets the new value in the store and returns it, otherwise it returns the existing one.
 */
export const getAttestationThunk =
  (): AppThunk<Promise<string>> => async (dispatch, getState) => {
    const state = getState();
    const instanceKeyTag = selectInstanceKeyTag(state);

    if (!instanceKeyTag) {
      throw new Error(
        'Instance key tag is not set. Cannot obtain attestation.'
      );
    }

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

      await regenerateCryptoKey(WIA_KEYTAG);
      const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

      const attestation = await WalletInstanceAttestation.getAttestation({
        wiaCryptoContext,
        integrityContext,
        walletProviderBaseUrl,
        appFetch
      });

      const walletAttestation = attestation[0].wallet_attestation;

      dispatch(setAttestation(walletAttestation));

      return walletAttestation;
    }

    return existingAttestation;
  };
