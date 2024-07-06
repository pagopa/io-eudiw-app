import { put, takeLatest, fork, call } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { ReduxSagaEffect } from "../types/utils";
import { startApplicationInitialization } from "../store/actions/application";
import { startupLoadSuccess } from "../store/actions/startup";
import { StartupStatusEnum } from "../store/reducers/startup";
import { watchItwSaga } from "../features/itwallet/saga";
import { checkIsFirstOnboardingSaga } from "./startup/checkIsFirstOnboardingSaga";
import { checkConfiguredPinSaga } from "./startup/checkConfiguredPinSaga";

export function* initializeApplicationSaga() {
  yield* put(startupLoadSuccess(StartupStatusEnum.ONBOARDING));
  yield* call(checkIsFirstOnboardingSaga);
  yield* call(checkConfiguredPinSaga);
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
