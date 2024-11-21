import {all, call} from 'typed-redux-saga';
import {startupSaga} from './startup';

/**
 * The root saga that forks and includes all the other sagas.
 */
export default function* rootSaga() {
  yield* all([yield* call(startupSaga)]);
}
