/**
 * Async status utils to be used in a redux store to manage an async loading status.
 */

/**
 * Type definition for the async values.
 * The generic type T is the data type that the async status will carry.
 * The optional generic type E is a string literal union that constrains the error type discriminant.
 *  it includes:
 * success - which indicates wether or not the async status has been successful or not, along with an optional data object.
 * loading - which indicates wether or not the asyn status is currently loading.
 * error - which indicates if an error occurred and carries the error object as well, with an optional typed discriminant.
 */
type AsyncStatusValues<T = undefined, E extends string = never> = {
  loading: boolean;
  error:
    | { status: false; error: undefined }
    | ([E] extends [never]
        ? { status: true; error: unknown }
        : { status: true; error: unknown; type: E });
  success: { status: false } | { status: true; data?: T };
};

/**
 * Async status object for an initial {@link AsyncStatusValues} state
 */
const setInitial = <T, E extends string = never>(): AsyncStatusValues<
  T,
  E
> => ({
  loading: false,
  error: { status: false, error: undefined },
  success: { status: false }
});

/**
 * Async status object for a successfull {@link AsyncStatusValues} state
 */
const setSuccess = <T, E extends string = never>(
  data?: T
): AsyncStatusValues<T, E> => ({
  loading: false,
  error: { status: false, error: undefined },
  success: { status: true, data }
});

/**
 * Async status object for a loading {@link AsyncStatusValues} state
 */
const setLoading = <T, E extends string = never>(): AsyncStatusValues<
  T,
  E
> => ({
  loading: true,
  error: { status: false, error: undefined },
  success: { status: false }
});

/**
 * Async status object for an error {@link AsyncStatusValues} state
 * @param error - the error value to be set in the error object.
 * @param type - optional string literal discriminant to identify the error type.
 * @returns the {@link AsyncStatusValues} object with the error value set.
 */
const setError = <T, E extends string = never>(
  error: unknown,
  type?: E
): AsyncStatusValues<T, E> => ({
  loading: false,
  error: {
    status: true,
    error,
    ...(type !== undefined ? { type } : {})
  } as AsyncStatusValues<T, E>['error'],
  success: { status: false }
});

export { setInitial, setSuccess, setLoading, setError, type AsyncStatusValues };
