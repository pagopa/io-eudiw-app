import {
  Action,
  ListenerEffect,
  ListenerEffectAPI,
  TypedStartListening
} from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../store/types';

/**
 * Typed version of the startListening method which includes the correct RootState and AppDispatch types.
 * It can be used to define a new listener.
 */
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

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
