import { AppStartListening } from '../../../middleware/listener';
import { addCredentialListeners } from './credential';
import { addPidListeners } from './pid';
import { addPresentationListeners } from './presentation';
import { addProximityListeners } from './proximity';

export const addWalletListeners = (startAppListening: AppStartListening) => {
  addPidListeners(startAppListening);
  addCredentialListeners(startAppListening);
  addPresentationListeners(startAppListening);
  addProximityListeners(startAppListening);
};
