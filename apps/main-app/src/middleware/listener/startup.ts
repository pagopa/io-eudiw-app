import { isAnyOf, UnknownAction } from '@reduxjs/toolkit';
import * as SplashScreen from 'expo-splash-screen';
import { Linking } from 'react-native';
import { isPinOrFingerprintSet } from 'react-native-device-info';
import { selectUrl } from '../../store/reducers/deeplinking';

import {
  startupSetAttributes,
  startupSetError,
  startupSetStatus,
  StartupSlice
} from '../../store/reducers/startup';
import { AppListener, AppListenerWithAction } from './types';
import {
  getBiometricState,
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '@io-eudiw-app/identification';
import { initEnv } from '@io-eudiw-app/env';
import {
  preferencesSetIsFirstStartupFalse,
  preferencesSetIsOnboardingDone,
  selectIsFirstStartup,
  selectIsOnboardingComplete
} from '@io-eudiw-app/preferences';
import { itWalletFeature } from '@io-eudiw-app/it-wallet';
import { addIdentificationListeners } from '@io-eudiw-app/identification';
import { startAppListening } from '.';
import { isNavigationReady } from '@io-eudiw-app/navigation';

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
    // Load the env variables
    initEnv();

    // Check for device capabilities in terms of biometrics and screen lock
    const state = listenerApi.getState();
    const biometricState = await getBiometricState();
    const hasScreenLock = await isPinOrFingerprintSet();
    listenerApi.dispatch(
      startupSetAttributes({
        biometricState,
        hasScreenLock
      })
    );

    // Handle onboarding process or identification based on onboarding completion status
    const isOnboardingCompleted = selectIsOnboardingComplete(state);
    const status: StartupSlice['startUpStatus'] = isOnboardingCompleted
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
    itWalletFeature.addListeners(startAppListening);
    addIdentificationListeners(startAppListening);

    // Check if this is the first startup app and flip the flag in the store.
    // This is required because other features might want to know if this is the first time the app is started to clear their persisted state.
    const isFirstStartup = selectIsFirstStartup(state);
    if (isFirstStartup) {
      listenerApi.dispatch(preferencesSetIsFirstStartupFalse());
    }

    // Handle deep linking
    await waitForNavigationToBeReady(listenerApi);
    listenerApi.dispatch(startupSetStatus('DONE'));
    await handlePendingDeepLink(listenerApi);
  } catch {
    listenerApi.dispatch(startupSetError());
    SplashScreen.hide();
  }
};
