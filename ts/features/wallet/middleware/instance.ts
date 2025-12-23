import Config from 'react-native-config';
import {WalletInstance} from '@pagopa/io-react-native-wallet';
import {serializeError} from 'serialize-error';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import {selectSessionId} from '../../../store/reducers/preferences';
import {selectInstanceKeyTag, setInstanceKeyTag} from '../store/instance';
import {createWalletProviderFetch} from '../utils/fetch';
import {createAppAsyncThunk} from '../../../middleware/thunk';

export const createInstanceThunk = createAppAsyncThunk<void, void>(
  'pidIssuanceStatus/createInstance',
  async (_, {getState, dispatch, rejectWithValue}) => {
    try {
      const state = getState();
      const instanceKeyTag = selectInstanceKeyTag(state);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      if (!instanceKeyTag) {
        const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
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
      return rejectWithValue({error: serializeError(err)});
    }
  }
);
