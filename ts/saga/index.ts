import {all, call} from 'typed-redux-saga';
import {startupSaga} from './startup';

/**
 * The root saga that forks and includes all the other sagas.
 */
export default function* rootSaga() {
  /**
   * Currently runs the startup saga and the wallet saga. However in the future
   * the wallet saga must be forked only after user pin identification.
   */
  yield* all([call(startupSaga)]);
}
