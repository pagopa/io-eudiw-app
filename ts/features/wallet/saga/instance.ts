import {call, put, race, select, take, takeLatest} from 'typed-redux-saga';
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

export function* watchInstanceSaga() {
  yield* takeLatest([setInstanceCreationRequest], function* (...args) {
    yield* race({
      task: call(handleCreateInstance, ...args),
      cancel: take(resetInstanceCreation)
    });
  });
}

/**
 * Saga which handles the creation of a wallet instance.
 * If a wallet instance already exists this will be skipped.
 * There's no revokation mechanism at the moment, so this doesn't get checked.
 */
export function* handleCreateInstance() {
  try {
    const instanceKeyTag = yield* select(selectInstanceKeyTag);

    if (!instanceKeyTag) {
      const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
      const sessionId = yield* select(selectSessionId);
      const appFetch = createWalletProviderFetch(
        walletProviderBaseUrl,
        sessionId
      );
      const keyTag = yield* call(generateIntegrityHardwareKeyTag);
      const integrityContext = getIntegrityContext(keyTag);

      yield* call(WalletInstance.createWalletInstance, {
        integrityContext,
        walletProviderBaseUrl,
        appFetch
      });
      yield* put(setInstanceKeyTag(keyTag));
    }
    yield* put(setInstanceCreationSuccess());
  } catch (err: unknown) {
    yield* put(setInstanceCreationError({error: serializeError(err)}));
  }
}
