/**
 * The root saga that forks and includes all the other sagas.
 */
import { call, all } from "typed-redux-saga/macro";
import { startupSaga } from "./startup";

export default function* root() {
  yield* all([call(startupSaga)]);
}
