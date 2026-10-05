import { getEnv } from '@io-eudiw-app/env';
import { IoWallet } from '@pagopa/io-react-native-wallet';

import {
  selectInstanceKeyTag,
  selectSessionId,
  setInstanceKeyTag
} from '../store/instance';
import { WALLET_SPEC_VERSION } from '../utils/constants';
import { serializeErrorOrUnknown } from '../utils/errors';
import { createWalletFetch } from '../utils/fetch';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import { createAppAsyncThunk } from './thunk';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const createInstanceThunk = createAppAsyncThunk<void, void>(
  'instance/createInstance',
  async (_, { dispatch, getState, rejectWithValue }) => {
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
        dispatch(setInstanceKeyTag(keyTag));
      }
      return;
    } catch (err: unknown) {
      return rejectWithValue({ error: serializeErrorOrUnknown(err) });
    }
  }
);
