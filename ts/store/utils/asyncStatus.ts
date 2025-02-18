/**
 * Async status utils to be used in a redux store to manage an async loading status.
 */

/**
 * Type definition for the async values.
 * The generic type T is the data type that the async status will carry.
 *  it includes:
 * success - which indicates wether or not the async status has been successful or not, along with an optional data object.
 * loading - which indicates wether or not the asyn status is currently loading.
 * error - which indicates if an error occurred and carries the error object as well.
 */
type AsyncStatusValues<T = undefined> = {
  loading: boolean;
  error: {status: false; error: undefined} | {status: true; error: unknown};
  success: {status: false} | {status: true; data?: T};
  cancel: {status: boolean};
};

/**
 * Async status object for an initial {@link AsyncStatusValues} state
 */
const setInitial = <T>(): AsyncStatusValues<T> => ({
  loading: false,
  error: {status: false, error: undefined},
  success: {status: false},
  cancel: {status: false}
});

/**
 * Async status object for a successfull {@link AsyncStatusValues} state
 */
const setSuccess = <T>(data?: T): AsyncStatusValues<T> => ({
  loading: false,
  error: {status: false, error: undefined},
  success: {status: true, data},
  cancel: {status: false}
});

/**
 * Async status object for a loading {@link AsyncStatusValues} state
 */
const setLoading = <T>(): AsyncStatusValues<T> => ({
  loading: true,
  error: {status: false, error: undefined},
  success: {status: false},
  cancel: {status: false}
});

/**
 * Async status object for an error {@link AsyncStatusValues} state
 * @param errorValue - the error value to be set in the error object.
 * @returns the {@link AsyncStatusValues} object with the error value set.
 */
const setError = <T>(error: unknown): AsyncStatusValues<T> => ({
  loading: false,
  error: {status: true, error},
  success: {status: false},
  cancel: {status: false}
});

/**
 * Async status object for a cancelled {@link AsyncStatusValues} state
 * @returns the {@link AsyncStatusValues} object with the cancel value set.
 */
const setCancel = <T>(): AsyncStatusValues<T> => ({
  loading: false,
  error: {status: false, error: undefined},
  success: {status: false},
  cancel: {status: true}
});

export {
  setInitial,
  setSuccess,
  setLoading,
  setError,
  setCancel,
  type AsyncStatusValues
};
