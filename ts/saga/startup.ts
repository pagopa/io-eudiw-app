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
import {walletSaga} from '../features/wallet/saga';
import {selectUrl} from '../store/reducers/deeplinking';
import {isNavigationReady} from '../navigation/utils';
import {resetLifecycle} from '../features/wallet/store/lifecycle';
import {
  IdentificationResultTask,
  startSequentializedIdentificationProcess
} from './identification';

/**
 * Helper function that is called when the wallet owner successfully identifies at application startup
 */
function* onStartupIdentified() {
  yield* call(BootSplash.hide, {fade: true});
  yield* fork(walletSaga);
  yield* call(waitForNavigationToBeReady);
  yield* put(startupSetStatus('DONE'));
  yield* call(handlePendingDeepLink);
}

/**
 * Helper function that is called when the wallet owner doesn't authenticate successfully at application startup
 */
function* onStartupUnidentified() {
  throw new Error('Identification failed'); // Temporary error which should be mapped
}

function* startIdentification() {
  yield* put(startupSetStatus('WAIT_IDENTIFICATION'));

  const onIdentifiedTask: IdentificationResultTask<typeof onStartupIdentified> =
    {
      fn: onStartupIdentified,
      args: []
    };

  const OnUnidentifiedTask: IdentificationResultTask<
    typeof onStartupUnidentified
  > = {
    fn: onStartupUnidentified,
    args: []
  };

  yield* call(
    startSequentializedIdentificationProcess,
    {
      canResetPin: true,
      isValidatingTask: false
    },
    onIdentifiedTask,
    OnUnidentifiedTask
  );
}

/**
 * Utility generator function to wait for the navigation to be ready before dispatching a navigation event.
 */
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

/**
 * Handles the pending deep link by opening the URL if it exists in the deep linking store.
 */
function* handlePendingDeepLink() {
  const url = yield* select(selectUrl);
  if (url) {
    yield* call(() => Linking.openURL(url));
  }
}

/**
 * Stars the onboarding process by setting the status which will be taked by the navigator to render the onboarding navigation stack.
 */
function* startOnboarding() {
  yield* put(startupSetStatus('WAIT_ONBOARDING'));
  yield* call(BootSplash.hide, {fade: true});
  yield* take(preferencesSetIsOnboardingDone);
  /* This clears the wallet state in order to ensure a clean state, specifically on iOS
   * where data stored in the keychain is not cleared on app uninstall.
   */
  yield* put(resetLifecycle());
  yield* fork(walletSaga);
  yield* put(startupSetStatus('DONE'));
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
