import { getEnv } from '@io-eudiw-app/env';
import { IoWallet } from '@pagopa/io-react-native-wallet';

import {
  selectInstanceKeyTag,
  selectSessionId
} from '../store/instanceSelectors';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { serializeErrorOrUnknown } from '../utils/errors';
import { createWalletFetch } from '../utils/fetch';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import { createAppAsyncThunk } from './thunk';

/**
 * Creates the wallet instance if missing and returns the new integrity key tag,
 * which the slice stores on fulfillment. Returns undefined if already created.
 */
export const createInstanceThunk = createAppAsyncThunk<
  string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  void
>('instance/createInstance', async (_, { getState, rejectWithValue }) => {
  try {
    const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
    const state = getState();
    const instanceKeyTag = selectInstanceKeyTag(state);

    if (!instanceKeyTag) {
      const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
        getEnv();
      const sessionId = selectSessionId(state);
      const appFetch = createWalletFetch(sessionId);
      const keyTag = await generateIntegrityHardwareKeyTag();
      const integrityContext = getIntegrityContext(keyTag);

      await wallet.WalletInstance.createWalletInstance({
        appFetch,
        integrityContext,
        walletProviderBaseUrl
      });
      return keyTag;
    }
    return undefined;
  } catch (err: unknown) {
    console.log(err);
    return rejectWithValue({ error: serializeErrorOrUnknown(err) });
  }
});
