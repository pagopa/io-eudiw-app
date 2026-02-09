import {
  createCryptoContextFor,
  WalletInstanceAttestation
} from '@pagopa/io-react-native-wallet';
import { getEnv } from '../../../config/env';
import { selectSessionId } from '../../../store/reducers/preferences';
import { AppThunk } from '../../../store/types';
import { regenerateCryptoKey } from '../../../utils/crypto';
import { selectAttestation, setAttestation } from '../store/attestation';
import { selectInstanceKeyTag } from '../store/instance';
import { isWalletInstanceAttestationValid } from '../utils/attestation';
import { WIA_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { getIntegrityContext } from '../utils/integrity';

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
      const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
        getEnv();
      const appFetch = createWalletProviderFetch(
        walletProviderBaseUrl,
        sessionId
      );

      const integrityContext = getIntegrityContext(instanceKeyTag);

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

      // TODO: WLEO-727 - rework to support multiple attestations issuance
      const walletAttestation = attestation[0].wallet_attestation;

      dispatch(setAttestation(walletAttestation));

      return walletAttestation;
    }

    return existingAttestation;
  };
