import { put, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { ReduxSagaEffect } from "../types/utils";
import { startApplicationInitialization } from "../store/actions/application";
import { startupLoadSuccess } from "../store/actions/startup";
import { StartupStatusEnum } from "../store/reducers/startup";

export function* initializeApplicationSaga() {
  // TO DO
  yield* put(startupLoadSuccess(StartupStatusEnum.AUTHENTICATED));
}

export function* startupSaga(): IterableIterator<ReduxSagaEffect> {
  // Wait until the IngressScreen gets mounted
  yield* takeLatest(
    getType(startApplicationInitialization),
    initializeApplicationSaga
  );
}
