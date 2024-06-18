import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  /* GENERIC */
  yield* fork(watchItwWiaSaga);
  yield* fork(watchItwActivationSaga);
}
