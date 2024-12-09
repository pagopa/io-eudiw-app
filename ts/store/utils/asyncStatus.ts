/**
 * Async status utils to be used in a redux store to manage an async loading status.
 */

/**
 * Type definition for the async values, it includes:
 * success - which indicates wether or not the async status has been successful or not.
 * loading - which indicates wether or not the asyn status is currently loading.
 * error - which indicates if an error occurred and carries the error object as well.
 */
type AsyncStatusValues = {
  success: boolean;
  loading: boolean;
  error: {status: false; error: undefined} | {status: true; error: unknown};
};

/**
 * Async status object for an initial {@link AsyncStatusValues} state
 */
const asyncStatusInitial: AsyncStatusValues = {
  success: false,
  loading: false,
  error: {status: false, error: undefined}
};

/**
 * Async status object for a successfull {@link AsyncStatusValues} state
 */
const asyncStateSuccess: AsyncStatusValues = {
  success: true,
  loading: false,
  error: {status: false, error: undefined}
};

/**
 * Async status object for a loading {@link AsyncStatusValues} state
 */
const asyncStateLoading: AsyncStatusValues = {
  success: false,
  loading: true,
  error: {status: false, error: undefined}
};

/**
 * Async status object for an error {@link AsyncStatusValues} state
 * @param errorValue - the error value to be set in the error object.
 * @returns the {@link AsyncStatusValues} object with the error value set.
 */
const asyncStateError = (errorValue: unknown): AsyncStatusValues => ({
  success: false,
  loading: false,
  error: {status: true, error: errorValue}
});

export {
  asyncStateSuccess,
  asyncStateLoading,
  asyncStatusInitial,
  asyncStateError,
  type AsyncStatusValues
};
