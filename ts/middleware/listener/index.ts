import {
  createListenerMiddleware,
  addListener,
  Action,
  ListenerEffect,
  ListenerEffectAPI,
  isAnyOf
} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '../../store/types';
import {startupSetLoading} from '../../store/reducers/startup';
import {preferencesReset} from '../../store/reducers/preferences';
import {startupListener} from './startup';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof startAppListening;

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListener;

export type AppListenerWithAction<ActionType extends Action> = ListenerEffect<
  ActionType,
  RootState,
  AppDispatch
>;

export type AppListener = ListenerEffectAPI<RootState, AppDispatch>;

/**
 * Mount here onlylisteners required for the startup process and other global listeners not related to specific features.
 * Feature-specific listeners are mounted by the startup process itself once the feature is initialized.
 */
startAppListening({
  matcher: isAnyOf(startupSetLoading, preferencesReset),
  effect: startupListener
});
