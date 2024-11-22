import {call, put, select} from 'typed-redux-saga';
import Config from 'react-native-config';
import {WalletInstance} from '@pagopa/io-react-native-wallet';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import {setAttestation} from '../store/attestation';
import {selectSessionId} from '../../../store/reducers/preferences';
import {selectInstanceKeyTag, setInstanceKeyTag} from '../store/instance';
import {createWalletProviderFetch} from '../utils/fetch';
import {setInstanceError, setInstanceSuccess} from '../store/pidIssuance';
import {getAttestation} from './handleGetAttestation';

export function* handleCreateInstance() {
  try {
    const existingInstanceKeyTag = yield* select(selectInstanceKeyTag);
    const instanceKeyTag = existingInstanceKeyTag
      ? existingInstanceKeyTag
      : yield* call(createInstance);
    const attestation = yield* call(getAttestation, instanceKeyTag);
    yield* put(setInstanceKeyTag({keyTag: instanceKeyTag}));
    yield* put(setAttestation(attestation));
    yield* put(setInstanceSuccess());
  } catch (err: unknown) {
    yield* put(setInstanceError({error: JSON.stringify(err)}));
  }
}

export function* createInstance() {
  const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
  const sessionId = yield* select(selectSessionId);
  const appFetch = createWalletProviderFetch(walletProviderBaseUrl, sessionId);
  const instanceKeyTag = yield* call(generateIntegrityHardwareKeyTag);
  const integrityContext = getIntegrityContext(instanceKeyTag);

  yield* call(WalletInstance.createWalletInstance, {
    integrityContext,
    walletProviderBaseUrl,
    appFetch
  });
  return instanceKeyTag;
}
