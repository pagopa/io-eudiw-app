import { Action, ListenerEffect, AnyAction, Dispatch } from '@reduxjs/toolkit';

/**
 * Flexible Take Latest Effect
 * S: State type
 * D: Dispatch type (defaults to standard Dispatch)
 * A: Action type
 */
export const takeLatestEffect =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S = any, D extends Dispatch = Dispatch, A extends Action = Action>(
      effect: ListenerEffect<A, S, D>,
      delayMs = 15
    ): ListenerEffect<A, S, D> =>
    async (action, listenerApi) => {
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(delayMs);
      return effect(action, listenerApi);
    };

/**
 * Flexible Race Effect
 */
export const raceEffect =
  <S = unknown, D extends Dispatch = Dispatch, A extends Action = AnyAction>(
    effect: ListenerEffect<A, S, D>,
    racers: Array<
      (listenerApi: Parameters<ListenerEffect<A, S, D>>[1]) => Promise<unknown>
    >,
    delayMs = 15
  ): ListenerEffect<A, S, D> =>
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
