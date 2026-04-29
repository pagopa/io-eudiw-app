import { createListenerMiddleware } from '@reduxjs/toolkit';
import { AppStartListening } from './types';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

/**
 * Dedicated listener middleware for mini-app listeners.
 * Using a separate instance allows clearing all mini-app listeners
 * without affecting global listeners when switching mini-apps.
 */
export const miniAppListenerMiddleware = createListenerMiddleware();

export const startMiniAppListening =
  miniAppListenerMiddleware.startListening as AppStartListening;
