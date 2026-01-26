import { ListenerEffect, Action } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../store/types';
import { AppListener } from '.';

/**
 * A wrapper for Redux Toolkit listeners that implements a takeLatest behavior.
 */
export const takeLatestEffect =
  <A extends Action>(
    effect: ListenerEffect<A, RootState, AppDispatch>,
    delayMs = 15
  ): ListenerEffect<A, RootState, AppDispatch> =>
  async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(delayMs);
    return effect(action, listenerApi);
  };

/**
 * A wrapper for Redux Toolkit listeners that implements a race behavior.
 */
export const raceEffect =
  <A extends Action>(
    effect: ListenerEffect<A, RootState, AppDispatch>,
    racers: Array<(listenerApi: AppListener) => Promise<unknown>>,
    delayMs = 15
  ): ListenerEffect<A, RootState, AppDispatch> =>
  async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();

    await listenerApi.delay(delayMs);
    if (listenerApi.signal.aborted) {
      return;
    }

    await Promise.race([
      effect(action, listenerApi),
      ...racers.map(r => r(listenerApi))
    ]);
  };
