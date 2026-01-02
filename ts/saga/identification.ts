import { call, fork, put, take } from 'typed-redux-saga';
import {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from '../store/reducers/identification';

type SetIdentificationStartedArgs = Parameters<
  typeof setIdentificationStarted
>[0];

/**
 * Type that represents a task to be executed in case of wallet owner identification success or falure
 */
export type IdentificationResultTask<
  F extends (...args: Array<any>) => Generator
> = {
  fn: F;
  args: Parameters<F>;
};

/**
 * This utility function handles proper sequentialization of the identification process
 *
 * @param payload The arguments of the {@link setIdentificationStarted} action
 * @param onIdentifiedTask A {@link IdentificationResultTask} that runs when the user authenticates
 * @param onUnidentifiedtask A {@link IdentificationResultTask} that runs when the user does not authenticate
 */
export function* startSequentializedIdentificationProcess<
  OnIdentifiedTask extends (...args: Array<any>) => Generator,
  OnUnidentifiedTask extends (...args: Array<any>) => Generator
>(
  payload: SetIdentificationStartedArgs,
  onIdentifiedTask: IdentificationResultTask<OnIdentifiedTask>,
  onUnidentifiedTask: IdentificationResultTask<OnUnidentifiedTask>
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
      yield* call(onIdentifiedTask.fn, ...onIdentifiedTask.args);
    } else {
      yield* call(onUnidentifiedTask.fn, ...onUnidentifiedTask.args);
    }
  });
  /**
   * Put the {@link setIdentificationStarted} action
   */
  yield* put(setIdentificationStarted(payload));
}
