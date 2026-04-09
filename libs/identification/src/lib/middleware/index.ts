import { addIdentificationPersistenceListeners } from './persistence';
import { AppStartListening } from './types';

/**
 * Adds all identification related listeners to the app listener middleware.
 */
export const addIdentificationListeners = (
  startAppListening: AppStartListening
) => {
  addIdentificationPersistenceListeners(startAppListening);
};
