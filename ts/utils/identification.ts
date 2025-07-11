import {call, fork, put, take} from 'typed-redux-saga';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';

type SetIdentificationStartedArgs = Parameters<
  typeof setIdentificationStarted
>[0];

/**
 * This utility function handles proper sequentialization of the identification process 
 *
 * @param payload The arguments of the {@link setIdentificationStarted} action
 * @param onIdentificationIdentified A generator function that runs when the user authenticates
 * @param onIdentificationUnidentified A generator function that runs when the user does not authenticate
 */
export function* startSequentializedIdentificationProcess(
  payload: SetIdentificationStartedArgs,
  onIdentificationIdentified: () => Generator,
  onIdentificationUnidentified: () => Generator
) {
  /**
   * Fork a saga to start waiting for the identification action before starting the identification
   * process to ensure there are listeners fer the {@link setIdentificationIdentified} and
   * {@link setIdentificationUnidentified} events
   */
  yield* fork(function* () {
    const action = yield* take([
      setIdentificationIdentified,
      setIdentificationUnidentified
    ]);
    if (setIdentificationIdentified.match(action)) {
      yield* call(onIdentificationIdentified);
    } else {
      yield* call(onIdentificationUnidentified)
    }
  })
  /**
   * Put the {@link setIdentificationStarted} action
   */
  yield* put(setIdentificationStarted(payload));
}
