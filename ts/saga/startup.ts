import BootSplash from 'react-native-bootsplash';
import {
  call,
  delay,
  fork,
  put,
  select,
  take,
  takeLatest
} from 'typed-redux-saga';
import {Linking} from 'react-native';
import initI18n from '../i18n/i18n';
import {
  startupSetAttributes,
  startupSetError,
  startupSetLoading,
  startupSetStatus
} from '../store/reducers/startup';
import {
  getBiometricState,
  hasDeviceScreenLock
} from '../features/onboarding/utils/biometric';
import {checkConfig} from '../config/configSetup';
import {
  preferencesReset,
  preferencesSetIsOnboardingDone,
  selectisOnboardingComplete
} from '../store/reducers/preferences';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';
import {walletSaga} from '../features/wallet/saga';
import {selectUrl} from '../store/reducers/deeplinking';
import {isNavigationReady} from '../navigation/utils';

function* startIdentification() {
  yield* put(startupSetStatus('WAIT_IDENTIFICATION'));
  yield* put(
    setIdentificationStarted({
      canResetPin: true,
      isValidatingTask: false
    })
  );
  yield* call(BootSplash.hide, {fade: true});
  const action = yield* take([
    setIdentificationIdentified,
    setIdentificationUnidentified
  ]);
  if (setIdentificationIdentified.match(action)) {
    yield* fork(walletSaga);
    yield* call(waitForNavigationToBeReady);
    yield* put(startupSetStatus('DONE'));
    yield* call(handlePendingDeepLink);
  } else {
    throw new Error('Identification failed'); // Temporary error which should be mapped
  }
}

function* waitForNavigationToBeReady() {
  const warningWaitNavigatorTime = 2000;
  const navigatorPollingTime = 125;
  // eslint-disable-next-line functional/no-let
  let isMainNavReady = yield* call(isNavigationReady);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;
  const startTime = performance.now();

  while (!isMainNavReady) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;
    }
    yield* delay(navigatorPollingTime);
    isMainNavReady = yield* call(isNavigationReady);
  }
}

function* startOnboarding() {
  yield* put(startupSetStatus('WAIT_ONBOARDING'));
  yield* call(BootSplash.hide, {fade: true});
  yield* take(preferencesSetIsOnboardingDone);
  yield* fork(walletSaga);
  yield* put(startupSetStatus('DONE'));
}

function* handlePendingDeepLink() {
  const url = yield* select(selectUrl);
  if (url) {
    yield* call(() => Linking.openURL(url));
  }
}

/**
 * Startup saga to initialize the app and load all the required resources.
 * It checks if env file is correct, initializes the translation library and checks the biometric state.
 * Then it starts the identification process if the onboarding is completed, otherwise it starts the onboarding.
 */
function* startup() {
  try {
    yield* call(initI18n);
    yield* call(checkConfig);
    const biometricState = yield* call(getBiometricState);
    const hasScreenLock = yield* call(hasDeviceScreenLock);
    yield* put(
      startupSetAttributes({
        biometricState,
        hasScreenLock
      })
    );
    const isOnboardingCompleted = yield* select(selectisOnboardingComplete);
    if (isOnboardingCompleted) {
      yield* call(startIdentification);
    } else {
      yield* call(startOnboarding);
    }
  } catch {
    yield* put(startupSetError());
    yield* call(BootSplash.hide, {fade: true});
  }
}

export function* startupSaga() {
  yield* takeLatest([startupSetLoading, preferencesReset], startup);
}
