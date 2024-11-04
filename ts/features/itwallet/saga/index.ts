import { fork } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

import { watchItwActivationSaga } from "./itwActivationSaga";
import { watchItwWiaSaga } from "./itwWiaSaga";
import { watchItwIssuancePidSaga } from "./itwIssuancePidSaga";
import { watchItwIssuanceCredentialSaga } from "./itwIssuanceCredentialSaga";
import { watchItwPrRemotePid } from "./itwPrRemotePidSaga";
import { watchItwPrRemoteCredentialSaga } from "./itwPrRemoteCredentialSaga";

/**
 * Watcher for any IT wallet related sagas.
 */
export function* watchItwSaga(): SagaIterator {
  /* GENERIC */
  yield* fork(watchItwWiaSaga);
  yield* fork(watchItwActivationSaga);
  /* ISSUANCE */
  yield* fork(watchItwIssuancePidSaga);
  yield* fork(watchItwIssuanceCredentialSaga);
  /* PRESENTATION */
  yield* fork(watchItwPrRemotePid);
  yield* fork(watchItwPrRemoteCredentialSaga);
}
