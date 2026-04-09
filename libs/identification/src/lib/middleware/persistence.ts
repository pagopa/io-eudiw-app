import { isAnyOf } from '@reduxjs/toolkit';
import { preferencesReset } from '@io-eudiw-app/preferences';
import { purgeIdentificationPersistedState } from '../reducer/index';
import { AppStartListening } from './types';

/**
 * Adds listeners to purge identification persisted state when a reset action is dispatched.
 * This complements the root reducer reset pattern by ensuring that the persisted storage
 * is also cleared, preventing stale state from being rehydrated on the next app launch.
 */
export const addIdentificationPersistenceListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    matcher: isAnyOf(preferencesReset),
    effect: async () => {
      await purgeIdentificationPersistedState();
    }
  });
};
