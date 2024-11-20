/**
 * The root saga that forks and includes all the other sagas.
 */
import {all, call} from 'typed-redux-saga';
import {startupSaga} from './startup';

export default function* rootSaga() {
  yield* all([yield* call(startupSaga)]);
}
