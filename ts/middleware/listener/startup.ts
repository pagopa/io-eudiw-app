import { isAnyOf, UnknownAction } from '@reduxjs/toolkit';
import * as SplashScreen from 'expo-splash-screen';
import { Linking } from 'react-native';
import { isPinOrFingerprintSet } from 'react-native-device-info';
import { checkConfig } from '../../config/env';
import { addWalletListeners } from '../../features/wallet/middleware';
import { resetLifecycle } from '../../features/wallet/store/lifecycle';
import { isNavigationReady } from '../../navigation/utils';
import { selectUrl } from '../../store/reducers/deeplinking';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../../store/reducers/identification';
import {
  preferencesSetIsOnboardingDone,
  selectisOnboardingComplete
} from '../../store/reducers/preferences';
import {
  startupSetAttributes,
  startupSetError,
  startupSetStatus,
  StartupState
} from '../../store/reducers/startup';
import { getBiometricState } from '../../utils/biometric';
import { AppListener, AppListenerWithAction } from './types';
import { startAppListening } from '.';

/**
 * Utility function to wait for the navigation to be ready before dispatching a navigation event.
 */
const waitForNavigationToBeReady = async (listenerApi: AppListener) => {
  const warningWaitNavigatorTime = 2000;
  const navigatorPollingTime = 125;
  let isMainNavReady = isNavigationReady();
  let timeoutLogged = false;
  const startTime = Date.now();
  while (!isMainNavReady) {
    const elapsedTime = Date.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;
    }
    await listenerApi.delay(navigatorPollingTime);
    isMainNavReady = isNavigationReady();
  }
};

/**
 * Handles the pending deep link by opening the URL if it exists in the deep linking store.
 */
const handlePendingDeepLink = async (listenerApi: AppListener) => {
  const url = selectUrl(listenerApi.getState());
  if (url) {
    await Linking.openURL(url);
  }
};

/**
 * Helper function to start the identification process. It takes the same parameters as a listener
 * as it interacts with the listener API.
 * It dispatches the action which triggers the identification modal and then waits for either success or failure.
 * @param _ - The dispatched action which triggered the listener
 * @param listenerApi - The listener API
 */
const startIdentification = async (listenerApi: AppListener) => {
  listenerApi.dispatch(
    setIdentificationStarted({ canResetPin: true, isValidatingTask: false })
  );
  // Wait for either success or failure
  const action = await listenerApi.take(
    isAnyOf(setIdentificationIdentified, setIdentificationUnidentified)
  );
  if (setIdentificationIdentified.match(action[0])) {
    return;
  } else if (setIdentificationUnidentified.match(action[0])) {
    throw new Error('Identification failed');
  }
};

/**
 * Starts the onboarding process by setting the status which will be taken by the navigator to render the onboarding navigation stack.
 */
const startOnboarding = async (listenerApi: AppListener) => {
  await listenerApi.take(isAnyOf(preferencesSetIsOnboardingDone));

  /* This clears the wallet state in order to ensure a clean state, specifically on iOS
   * where data stored in the keychain is not cleared on app uninstall.
   */
  listenerApi.dispatch(resetLifecycle());
};

/**
 * Helper function to start the startup process. It takes the same parameters as a listener
 * as it interacts with the listener API.
 * The startup process consists of checking the env config, checking biometric and screen lock status,
 * and then deciding whether to start the onboarding or identification process based on the onboarding completion status which
 * is persisted in the preferences slice.
 * The root navigator mounts the appropriate navigator based on the startup status set by this listener.
 * @param _ - The dispatched action which triggered the listener
 * @param listenerApi - The listener API
 */
export const startupListener: AppListenerWithAction<UnknownAction> = async (
  _,
  listenerApi
) => {
  try {
    // Check env config and device capabilities
    const state = listenerApi.getState();
    checkConfig();
    const biometricState = await getBiometricState();
    const hasScreenLock = await isPinOrFingerprintSet();
    listenerApi.dispatch(
      startupSetAttributes({
        biometricState,
        hasScreenLock
      })
    );

    // Handle onboarding process or identification based on onboarding completion status
    const isOnboardingCompleted = selectisOnboardingComplete(state);
    const status: StartupState['startUpStatus'] = isOnboardingCompleted
      ? 'WAIT_IDENTIFICATION'
      : 'WAIT_ONBOARDING';
    listenerApi.dispatch(startupSetStatus(status));
    SplashScreen.hide();
    if (isOnboardingCompleted) {
      await startIdentification(listenerApi);
    } else {
      await startOnboarding(listenerApi);
    }

    // Registers all the listeners related to the app features.
    addWalletListeners(startAppListening);

    // Handle deep linking
    await waitForNavigationToBeReady(listenerApi);
    listenerApi.dispatch(startupSetStatus('DONE'));
    await handlePendingDeepLink(listenerApi);
  } catch {
    listenerApi.dispatch(startupSetError());
    SplashScreen.hide();
  }
};
