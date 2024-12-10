import {fork, put, select, take, takeLatest} from 'typed-redux-saga';
import {startupSetDone} from '../store/reducers/startup';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';
import {walletSaga} from '../features/wallet/saga';
import {selectisOnboardingComplete} from '../store/reducers/preferences';

function* startup() {
  const isOnboardingCompleted = yield* select(selectisOnboardingComplete);
  if (isOnboardingCompleted) {
    yield* put(
      setIdentificationStarted({
        canResetPin: true,
        isValidatingTask: false
      })
    );
    const action = yield* take([
      setIdentificationIdentified,
      setIdentificationUnidentified
    ]);
    if (setIdentificationIdentified.match(action)) {
      yield* fork(walletSaga);
    }
  }
}

export function* startupSaga() {
  yield* takeLatest(startupSetDone, startup);
}
