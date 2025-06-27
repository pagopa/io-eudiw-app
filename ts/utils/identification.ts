import {actionChannel, put, take} from 'typed-redux-saga';
import {Channel} from 'redux-saga';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';

type SetIdentificationStartedArgs = Parameters<
  typeof setIdentificationStarted
>[0];

/**
 * This utility function handles proper sequentialization of the identification process by using a {@link Channel}
 * which buffers {@link setIdentificationIdentified} and {@link setIdentificationUnidentified} actions.
 *
 * Sequentialization (in form of buffering) is needed because of a race condition for which,
 * after starting the identification flow by dispatching a {@link setIdentificationStarted} actions,
 * the {@link setIdentificationIdentified} and {@link setIdentificationUnidentified} action are dispatched
 * before the saga starts listening for them, leading to a deadlock.
 *
 * To guarantee correct sequentialization, the identification process result actions MUST be taken from the
 * return channel
 *
 * @param payload The arguments of the {@link setIdentificationStarted} action
 * @returns An action channel which buffers {@link setIdentificationIdentified} and {@link setIdentificationUnidentified} actions.
 *          The channel MUST be used to {@link take} the identification result
 */
export function* startSequentializedIdentificationProcess(
  payload: SetIdentificationStartedArgs
) {
  /**
   * To ensure sequentialization, setup the listeners for the actions that will be fired after {@link setIdentificationStarted}
   */
  const channel = yield* actionChannel([
    setIdentificationIdentified,
    setIdentificationUnidentified
  ]);
  /**
   * Put the {@link setIdentificationStarted} action
   */
  yield* put(setIdentificationStarted(payload));
  // Return the channel for further processing
  return channel;
}
