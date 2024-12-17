import {all} from 'typed-redux-saga';
import {watchInstanceSaga} from './instance';
import {watchPidSaga} from './pid';
import {watchCredentialSaga} from './credential';

/**
 * Main saga for the wallet feature.
 * New sagas related to the wallet which are triggered by actions should be added here.
 */
export function* walletSaga() {
  yield* all([
    yield* watchInstanceSaga(),
    yield* watchPidSaga(),
    yield* watchCredentialSaga()
  ]);
}
