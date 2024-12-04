import {call, put, select, takeLatest} from 'typed-redux-saga';
import Config from 'react-native-config';
import {Errors, WalletInstance} from '@pagopa/io-react-native-wallet';
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from '../utils/integrity';
import {setAttestation} from '../store/attestation';
import {selectSessionId} from '../../../store/reducers/preferences';
import {selectInstanceKeyTag, setInstanceKeyTag} from '../store/instance';
import {createWalletProviderFetch} from '../utils/fetch';
import {
  setInstanceCreationError,
  setInstanceCreationRequest,
  setInstanceCreationSuccess
} from '../store/pidIssuance';
import {getAttestation} from './attestation';

export function* watchInstanceSaga() {
  yield* takeLatest(setInstanceCreationRequest, handleCreateInstance);
}

/**
 * Saga which handles the creation of a wallet instance.
 * If a wallet instance already exists, it will use the existing instance key tag.
 * It then fetches a wallet attestation to check if the instance is valid.
 * If the attestation is valid then it is set in the store.
 * However, if the attestation returns an error which indicates that the instance has been revoked (403) or not found (404),
 * then it will create a new instance and obtain a new attestation.
 * If a wallet instance doesn't exists then it will create a new instance and obtain a new attestation.
 */
export function* handleCreateInstance() {
  try {
    const existingInstanceKeyTag = yield* select(selectInstanceKeyTag);

    if (existingInstanceKeyTag) {
      // Instance exists, try to get an attestation
      try {
        const attestation = yield* call(getAttestation, existingInstanceKeyTag);
        yield* put(setAttestation(attestation));
        // yield* put(setInstanceSuccess());
        // return;
      } catch (e) {
        // An error occurred while obtaining an attestation
        const err = e as Errors.WalletProviderResponseError;
        if (
          err.code !== 'ERR_IO_WALLET_INSTANCE_REVOKED' &&
          err.code !== 'ERR_IO_WALLET_INSTANCE_NOT_FOUND'
        ) {
          // If the error is not related to the instance being revoked or not found, re-throw the error
          throw err;
        }
      }
    }
    // Create a new instance if none exists or the existing instance is revoked or not found
    const keyTag = yield* call(createInstance);
    const attestation = yield* call(getAttestation, keyTag);
    yield* put(setInstanceKeyTag(keyTag));
    yield* put(setAttestation(attestation));
    yield* put(setInstanceCreationSuccess());
    console.log(attestation);
    // Reset the credential state before obtaining a new PID
    // dispatch(credentialReset());
  } catch (err: unknown) {
    yield* put(setInstanceCreationError({error: JSON.stringify(err)}));
  }
}

/**
 * Utility generator function to create a new wallet instance.
 * @returns the keytag used to create the wallet instance.
 */
export function* createInstance() {
  const walletProviderBaseUrl = Config.WALLET_PROVIDER_BASE_URL;
  const sessionId = yield* select(selectSessionId);
  const appFetch = createWalletProviderFetch(walletProviderBaseUrl, sessionId);
  const keyTag = yield* call(generateIntegrityHardwareKeyTag);
  const integrityContext = getIntegrityContext(keyTag);

  yield* call(WalletInstance.createWalletInstance, {
    integrityContext,
    walletProviderBaseUrl,
    appFetch
  });
  return keyTag;
}
