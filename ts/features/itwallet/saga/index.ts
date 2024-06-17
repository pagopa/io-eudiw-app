import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwActivationSaga } from "./itwActivationSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  /* GENERIC */
  yield* fork(watchItwActivationSaga);
}
