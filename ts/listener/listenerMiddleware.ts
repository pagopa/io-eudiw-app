import {
  createListenerMiddleware,
  addListener,
  Action,
  ListenerEffect,
  ListenerEffectAPI
} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '../store/types';
import {addStartupListeners} from './startup';

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

// Register startup listeners
addStartupListeners(startAppListening);
