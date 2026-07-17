import { addCredentialListeners } from './credential';
import { addCredentialVaultListeners } from './credentialVault';
import { addCredentialVaultCoherenceListener } from './credentialVaultCoherence';
import { addPidListeners } from './pid';
import { addPresentationListeners } from './presentation';
import { addProximityListeners } from './proximity';
import { AppStartListening } from './types';

/**
 * Adds all wallet related listeners to the app listener middleware.
 */
export const addWalletListeners = (startAppListening: AppStartListening) => {
  addPidListeners(startAppListening);
  addCredentialListeners(startAppListening);
  addCredentialVaultListeners(startAppListening);
  addCredentialVaultCoherenceListener(startAppListening);
  addPresentationListeners(startAppListening);
  addProximityListeners(startAppListening);
};
