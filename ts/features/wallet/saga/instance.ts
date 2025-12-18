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
import {
  resetInstanceCreation,
  setInstanceCreationError,
  setInstanceCreationRequest,
  setInstanceCreationSuccess
} from '../store/pidIssuance';
import {
  AppListenerWithAction,
  AppStartListening
} from '../../../listener/listenerMiddleware';

const handleCreateInstance: AppListenerWithAction<
  ReturnType<typeof setInstanceCreationRequest>
> = async (_, listenerApi) => {
  try {
    const state = listenerApi.getState();
    const instanceKeyTag = selectInstanceKeyTag(state);

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
      listenerApi.dispatch(setInstanceKeyTag(keyTag));
    }
    listenerApi.dispatch(setInstanceCreationSuccess());
  } catch (err: unknown) {
    listenerApi.dispatch(
      setInstanceCreationError({error: serializeError(err)})
    );
  }
};

export const addInstanceListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: setInstanceCreationRequest,
    effect: async (action, listenerApi) => {
      // Cancel previous instance creation tasks if any as takeLatest
      listenerApi.cancelActiveListeners();

      // Also listen for resetInstanceCreation action to abort the instance creation process as race
      const abortPromise = new Promise<void>(resolve => {
        startAppListening({
          actionCreator: resetInstanceCreation,
          effect: () => resolve()
        });
      });

      await Promise.race([
        handleCreateInstance(action, listenerApi),
        abortPromise
      ]);
    }
  });
};
