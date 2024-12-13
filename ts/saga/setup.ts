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
import {checkConfig} from '../config/configSetup';
import {preferencesReset} from '../store/reducers/preferences';

/**
 * Setup saga to initialize the app and load all the required resources.
 * It checks if env file is correct, initializes the translation library and checks the biometric state.
 */
function* setup() {
  try {
    yield* call(initI18n);
    yield* call(checkConfig);
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

export function* setupSaga() {
  yield* takeLatest([startupSetLoading, preferencesReset], setup);
}
