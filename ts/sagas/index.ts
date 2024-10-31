/**
 * The root saga that forks and includes all the other sagas.
 */
import { call, all } from "typed-redux-saga/macro";
import { startupSaga } from "./startup";
import { watchIdentification } from "./identification";
import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";

export default function* root() {
  yield* all([
    call(startupSaga),
    call(watchApplicationActivitySaga),
    call(watchIdentification)
  ]);
}
