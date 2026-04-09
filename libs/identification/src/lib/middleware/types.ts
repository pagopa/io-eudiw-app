import {
  Action,
  ListenerEffect,
  ListenerEffectAPI,
  TypedStartListening
} from '@reduxjs/toolkit';
import {
  IdentificationCombinedRootState,
  IdentificationDispatch
} from '../reducer/index';

export type AppStartListening = TypedStartListening<
  IdentificationCombinedRootState,
  IdentificationDispatch
>;

export type AppListenerWithAction<ActionType extends Action> = ListenerEffect<
  ActionType,
  IdentificationCombinedRootState,
  IdentificationDispatch
>;

export type AppListener = ListenerEffectAPI<
  IdentificationCombinedRootState,
  IdentificationDispatch
>;
