import { regenerateCryptoKey } from '@io-eudiw-app/commons';
import { getEnv } from '@io-eudiw-app/env';
import { IoWallet, type KeyAttestation } from '@pagopa/io-react-native-wallet';

import { AppThunk } from '../store';
import {
  setWalletInstanceAttestation,
  shouldRequestWalletInstanceAttestationSelector
} from '../store/attestation';
import { selectInstanceKeyTag, selectSessionId } from '../store/instance';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { createLocalSignerFor, WIA_KEYTAG } from '../utils/crypto';
import { getIntegrityContext } from '../utils/integrity';
import { createAppAsyncThunk } from './thunk';

/**
 * Thunk to obtain the wallet instance attestation.
 * It requests the attestation if not in the store or if it's invalid.
 * It sets the new value in the store and returns it, otherwise it returns the existing one.
 */
export const getWalletInstanceAttestationThunk =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const state = getState();
    const instanceKeyTag = selectInstanceKeyTag(state);

    if (!instanceKeyTag) {
      throw new Error(
        'Instance key tag is not set. Cannot obtain attestation.'
      );
    }

    if (shouldRequestWalletInstanceAttestationSelector(getState())) {
      const sessionId = selectSessionId(state);
      const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
        getEnv();

      const integrityContext = getIntegrityContext(instanceKeyTag);

      await regenerateCryptoKey(WIA_KEYTAG);
      const wiaSigner = createLocalSignerFor(WIA_KEYTAG);

      /**
       * Obtains a new Wallet Instance Attestation.
       * WARNING: The integrity context must be the same used when creating the Wallet Instance with the same keytag.
       */
      const issuingAttestation =
        await wallet.WalletInstanceAttestation.getAttestation(
          {
            walletProviderBaseUrl,
            walletSolutionId: 'appio',
            walletSolutionVersion: '3.26.0',
            xUserId: sessionId
          },
          {
            integrityContext,
            wiaSigner
          }
        );

      dispatch(setWalletInstanceAttestation(issuingAttestation));
      return;
    }
  };

type GetKeyAttestationThunkInput = {
  // The keys must already exist, either locally or on the Remote WSCD
  keysToAttest: KeyAttestation.KeyToAttest[];
};
type GetKeyAttestationThunkOutput = {
  attestation: string;
  format: string;
};

export const getKeyAttestationThunk = createAppAsyncThunk<
  GetKeyAttestationThunkOutput,
  GetKeyAttestationThunkInput
>(
  'hsm/walletinstance/keyattestation',
  async ({ keysToAttest }, { getState }) => {
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const sessionId = selectSessionId(getState());

    // Retrieve the integrity key tag from the store and create its context
    const integrityKeyTag = selectInstanceKeyTag(getState());
    if (!integrityKeyTag) {
      throw new Error('Integrity key not found');
    }
    const integrityContext = getIntegrityContext(integrityKeyTag);

    // Get env URLs
    const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
      getEnv();

    const challenge = await wallet.KeyAttestation.getChallenge({
      walletProviderBaseUrl
    });

    return await wallet.KeyAttestation.getAttestation(
      {
        walletProviderBaseUrl,
        walletSolutionId: 'appio',
        walletSolutionVersion: '3.26.0',
        xUserId: sessionId
      },
      {
        challenge,
        integrityContext,
        keysToAttest
      }
    );
  }
);
