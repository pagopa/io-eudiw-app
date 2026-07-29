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
  error:
    | ([E] extends [never]
        ? { error: unknown; status: true }
        : { error: unknown; status: true; type: E })
    | { error: undefined; status: false };
  loading: boolean;
  success: { data?: T; status: true } | { status: false };
};

/**
 * Async status object for an initial {@link AsyncStatusValues} state
 */
const setInitial = <T, E extends string = never>(): AsyncStatusValues<
  T,
  E
> => ({
  error: { error: undefined, status: false },
  loading: false,
  success: { status: false }
});

/**
 * Async status object for a successfull {@link AsyncStatusValues} state
 */
const setSuccess = <T, E extends string = never>(
  data?: T
): AsyncStatusValues<T, E> => ({
  error: { error: undefined, status: false },
  loading: false,
  success: { data, status: true }
});

/**
 * Async status object for a loading {@link AsyncStatusValues} state
 */
const setLoading = <T, E extends string = never>(): AsyncStatusValues<
  T,
  E
> => ({
  error: { error: undefined, status: false },
  loading: true,
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
  error: {
    error,
    status: true,
    ...(type !== undefined ? { type } : {})
  } as AsyncStatusValues<T, E>['error'],
  loading: false,
  success: { status: false }
});

export { type AsyncStatusValues, setError, setInitial, setLoading, setSuccess };
