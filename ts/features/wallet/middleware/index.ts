import { AppStartListening } from '../../../middleware/listener/types';
import { addCredentialListeners } from './credential';
import { addPidListeners } from './pid';
import { addPresentationListeners } from './presentation';
import { addProximityListeners } from './proximity';

/**
 * Adds all wallet related listeners to the app listener middleware.
 */
export const addWalletListeners = (startAppListening: AppStartListening) => {
  addPidListeners(startAppListening);
  addCredentialListeners(startAppListening);
  addPresentationListeners(startAppListening);
  addProximityListeners(startAppListening);
};
