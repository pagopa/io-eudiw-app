import {
  createCryptoContextFor,
  IoWallet,
  type WalletUnitAttestation as Wua,
  type KeyAttestationCryptoContext
} from '@io-eudiw-app/io-react-native-wallet';
import { selectInstanceKeyTag, selectSessionId } from '../store/instance';
import { WIA_KEYTAG } from '../utils/crypto';
import { createWalletProviderFetch } from '../utils/fetch';
import { getIntegrityContext } from '../utils/integrity';
import { regenerateCryptoKey } from '@io-eudiw-app/commons';
import { getEnv } from '@io-eudiw-app/env';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { generate } from '@pagopa/io-react-native-crypto';
import { createAppAsyncThunk } from './thunk';
import { AppThunk } from '../store';
import {
  setWalletInstanceAttestation,
  shouldRequestWalletInstanceAttestationSelector
} from '../store/attestation';

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
      const issuingAttestation =
        await wallet.WalletInstanceAttestation.getAttestation(
          {
            walletProviderBaseUrl,
            walletSolutionId: 'appio',
            walletSolutionVersion: '3.26.0'
          },
          {
            wiaCryptoContext,
            integrityContext,
            appFetch
          }
        );

      dispatch(setWalletInstanceAttestation(issuingAttestation));
      return;
    }
  };

type GetWalletUnitAttestationThunkInput = {
  keyTags: string[];
};
type GetWalletUnitAttestationThunkOutput = Awaited<
  ReturnType<Wua.WalletUnitAttestationSupportedApi['getAttestation']>
>;

export const getWalletUnitAttestationThunk = createAppAsyncThunk<
  GetWalletUnitAttestationThunkOutput,
  GetWalletUnitAttestationThunkInput
>('walletinstance/walletunitattestation', async ({ keyTags }, { getState }) => {
  const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });

  if (!wallet.WalletUnitAttestation.isSupported) {
    throw new Error(
      `Wallet Unit Attestation is not supported in v${WALLET_SPEC_VERSION}`
    );
  }

  // Retrieve the integrity key tag from the store and create its context
  const integrityKeyTag = selectInstanceKeyTag(getState());
  if (!integrityKeyTag) {
    throw new Error('Integrity key not found');
  }
  const integrityContext = getIntegrityContext(integrityKeyTag);

  // Get env URLs
  const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
    getEnv();

  return await wallet.WalletUnitAttestation.getAttestation(
    {
      walletProviderBaseUrl,
      walletSolutionId: 'appio',
      walletSolutionVersion: '3.26.0'
    },
    {
      integrityContext,
      keysToAttest: keyTags.map(createKeyAttestationCryptoContextFor)
    }
  );
});

// TO DO
const createKeyAttestationCryptoContextFor = (
  keyTag: string
): KeyAttestationCryptoContext => ({
  ...createCryptoContextFor(keyTag),
  async generateKeyWithAttestation(challenge) {
    await generate(keyTag);
    return { success: true };
  }
});
