
import { addCredentialListeners } from './credential';
import { addPidListeners } from './pid';
import { addPresentationListeners } from './presentation';
import { addProximityListeners } from './proximity';
import { AppStartListening } from './types';

/**
 * Adds all wallet related listeners to the app listener middleware.
 */
export const addWalletListeners = (startAppListening: AppStartListening) => {
  console.log('here');
  addPidListeners(startAppListening);
  addCredentialListeners(startAppListening);
  addPresentationListeners(startAppListening);
  addProximityListeners(startAppListening);
};
