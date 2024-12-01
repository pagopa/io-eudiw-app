import BootSplash from 'react-native-bootsplash';
import {call, put, takeLatest} from 'typed-redux-saga';
import initI18n from '../i18n/i18n';
import {
  startupSetDone,
  startupSetError,
  startupSetLoading
} from '../store/reducers/startup';
import {
  getBiometricState,
  hasDeviceScreenLock
} from '../features/onboarding/utils/biometric';

function* setupSaga() {
  try {
    yield* call(initI18n);
    const biometricState = yield* call(getBiometricState);
    const hasScreenLock = yield* call(hasDeviceScreenLock);
    yield* put(
      startupSetDone({
        biometricState,
        hasScreenLock
      })
    );
  } catch {
    yield* put(startupSetError());
  } finally {
    yield* call(BootSplash.hide, {fade: true});
  }
}

export function* startupSaga() {
  yield* takeLatest(startupSetLoading, setupSaga);
}
