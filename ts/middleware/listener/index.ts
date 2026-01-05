import {
  createListenerMiddleware,
  addListener,
  Action,
  ListenerEffect,
  ListenerEffectAPI,
  isAnyOf
} from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../store/types';
import { startupSetLoading } from '../../store/reducers/startup';
import { preferencesReset } from '../../store/reducers/preferences';
import { startupListener } from './startup';

/**
 * Listener middleware creation.
 */
export const listenerMiddleware = createListenerMiddleware();

/**
 * Typed version of the startListening method which includes the correct RootState and AppDispatch types.
 * It can be used to define a new listener.
 */
export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof startAppListening;

/**
 * Typed version of the listener which includes the correct RootState and AppDispatch types.
 */
const appAddListener = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof appAddListener;

/**
 * Type for a listener with typed action, state and dispatch. It can be used in conjunction with action which triggers the listener
 * in order to have the correct type for the action parameter of the listener function.
 * This can be used to type a listener function as follows:
 * const listenerFunction: AppListenerWithAction<
 * ReturnType<typeof dispatchedActionWhichTriggersTheListener>>
 * = async (action, listenerApi) => {...}
 */
export type AppListenerWithAction<ActionType extends Action> = ListenerEffect<
  ActionType,
  RootState,
  AppDispatch
>;

/**
 * Type for a listener function which doesn't depend on a specific action.
 * It can be used in helper functions which create listeners not tied to a specific action.
 */
export type AppListener = ListenerEffectAPI<RootState, AppDispatch>;

/**
 * Mount here only listeners required for the startup process and other global listeners not related to specific features.
 * Feature-specific listeners are mounted by the startup process itself once the feature is initialized.
 */
startAppListening({
  matcher: isAnyOf(startupSetLoading, preferencesReset),
  effect: startupListener
});
