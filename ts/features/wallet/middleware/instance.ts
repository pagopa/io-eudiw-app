import { WalletInstance } from '@pagopa/io-react-native-wallet';
import { serializeError } from 'serialize-error';
import { getEnv } from '../../../config/env';
import { createAppAsyncThunk } from '../../../middleware/thunk';
import { selectSessionId } from '../../../store/reducers/preferences';
import { selectInstanceKeyTag, setInstanceKeyTag } from '../store/instance';
import { createWalletProviderFetch } from '../utils/fetch';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';

export const createInstanceThunk = createAppAsyncThunk<void, void>(
  'pidIssuanceStatus/createInstance',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
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

        await WalletInstance.createWalletInstance({
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
