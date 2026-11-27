import { getEnv } from '@io-eudiw-app/env';
import { IoWallet } from '@pagopa/io-react-native-wallet';

import {
  selectInstanceKeyTag,
  selectSessionId,
  setInstanceKeyTag
} from '../store/instance';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { serializeErrorOrUnknown } from '../utils/errors';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import { createAppAsyncThunk } from './thunk';

/**
 * Creates a new wallet instance on the Wallet Provider, bound to a new hardware key.
 * @param xUserId - The user identifier sent as `x-user-id` to the Wallet Provider
 * @returns the keytag of the hardware key bound to the wallet instance
 */
export const createWalletInstance = async (xUserId: string) => {
  const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
  const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
    getEnv();
  const keyTag = await generateIntegrityHardwareKeyTag();
  const integrityContext = getIntegrityContext(keyTag);

  await wallet.WalletInstance.createWalletInstance({
    integrityContext,
    walletProviderBaseUrl,
    xUserId
  });
  return keyTag;
};

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const createInstanceThunk = createAppAsyncThunk<void, void>(
  'hsm/instance/createInstance',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const instanceKeyTag = selectInstanceKeyTag(state);

      if (!instanceKeyTag) {
        const keyTag = await createWalletInstance(selectSessionId(state));
        dispatch(setInstanceKeyTag(keyTag));
      }
      return;
    } catch (err: unknown) {
      return rejectWithValue({ error: serializeErrorOrUnknown(err) });
    }
  }
);
