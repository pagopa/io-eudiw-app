import {fork, put, select, take, takeLatest} from 'typed-redux-saga';
import {startupSetDone} from '../store/reducers/startup';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';
import {walletSaga} from '../features/wallet/saga';
import {selectisOnboardingComplete} from '../store/reducers/preferences';

/**
 * Startup saga which initializes the app.
 * It checks if the onboarding is completed and starts the wallet saga.
 */
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

/**
 * The startup saga which listens for the startup action.
 * It stats when the startup is complete, thus the app has all the resources to start.
 */
export function* startupSaga() {
  yield* takeLatest(startupSetDone, startup);
}
