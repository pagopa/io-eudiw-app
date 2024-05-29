import { SagaIterator } from "redux-saga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  // eslint-disable-next-line no-console
  console.log("IT Wallet");
}
