import { put, takeLatest, fork, call } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { ReduxSagaEffect } from "../types/utils";
import { startApplicationInitialization } from "../store/actions/application";
import { startupLoadSuccess } from "../store/actions/startup";
import { StartupStatusEnum } from "../store/reducers/startup";
import { watchItwSaga } from "../features/itwallet/saga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";
import { checkAcknowledgedFingerprintSaga } from "./onboarding/biometric/checkAcknowledgedFingerprintSaga";

export function* initializeApplicationSaga() {
  yield* put(startupLoadSuccess(StartupStatusEnum.ONBOARDING));
  yield* call(checkConfiguredPinSaga);
  yield* call(checkAcknowledgedFingerprintSaga);
  yield* put(startupLoadSuccess(StartupStatusEnum.AUTHENTICATED));

  yield* fork(watchItwSaga);
}

export function* startupSaga(): IterableIterator<ReduxSagaEffect> {
  // Wait until the IngressScreen gets mounted
  yield* takeLatest(
    getType(startApplicationInitialization),
    initializeApplicationSaga
  );
}
