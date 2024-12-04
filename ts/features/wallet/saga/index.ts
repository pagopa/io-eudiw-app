import {call} from 'typed-redux-saga';
import {watchInstanceSaga} from './instance';
import {watchPidSaga} from './pid';

/**
 * Main saga for the wallet feature.
 * New sagas related to the wallet which are triggered by actions should be added here.
 */
export function* walletSaga() {
  yield* call(watchInstanceSaga);
  yield* call(watchPidSaga);
}
