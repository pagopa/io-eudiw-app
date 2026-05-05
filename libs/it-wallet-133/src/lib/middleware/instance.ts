import { IoWallet } from '@pagopa/io-react-native-wallet';
import { serializeError } from 'serialize-error';
import {
  selectInstanceKeyTag,
  selectSessionId,
  setInstanceKeyTag
} from '../store/instance';
import { createWalletProviderFetch } from '../utils/fetch';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import { createAppAsyncThunk } from './thunk';
import { getEnv } from '@io-eudiw-app/env';
import { WALLET_SPEC_VERSION } from '../utils/constants';

export const createInstanceThunk = createAppAsyncThunk<void, void>(
  'instance133/createInstance',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const wallet = new IoWallet({ version: WALLET_SPEC_VERSION });
      const state = getState();
      const instanceKeyTag = selectInstanceKeyTag(state);

      if (!instanceKeyTag) {
        const { EXPO_PUBLIC_WALLET_PROVIDER_BASE_URL: walletProviderBaseUrl } =
          getEnv();
        const sessionId = selectSessionId(state);
        const appFetch = createWalletProviderFetch(
          walletProviderBaseUrl,
          sessionId
        );
        const keyTag = await generateIntegrityHardwareKeyTag();
        const integrityContext = getIntegrityContext(keyTag);

        await wallet.WalletInstance.createWalletInstance({
          integrityContext,
          walletProviderBaseUrl,
          appFetch
        });
        dispatch(setInstanceKeyTag(keyTag));
      }
      return;
    } catch (err: unknown) {
      return rejectWithValue({ error: serializeError(err) });
    }
  }
);
