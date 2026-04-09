import { isAnyOf } from '@reduxjs/toolkit';
import {
  preferencesReset,
  preferencesSetIsFirstStartupFalse
} from '@io-eudiw-app/preferences';
import { resetLifecycle } from '../store/lifecycle';
import { purgeWalletPersistedState } from '../store';
import { AppStartListening } from './types';

/**
 * Adds listeners to purge wallet persisted state when a reset action is dispatched.
 * This complements the root reducer reset pattern by ensuring that the persisted storage
 * is also cleared, preventing stale state from being rehydrated on the next app launch.
 */
export const addPersistenceListeners = (
  startAppListening: AppStartListening
) => {
  startAppListening({
    matcher: isAnyOf(
      resetLifecycle,
      preferencesReset,
      preferencesSetIsFirstStartupFalse
    ),
    effect: async () => {
      await purgeWalletPersistedState();
    }
  });
};
