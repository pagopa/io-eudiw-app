/**
 * Ensure that the types T and U are mutually exclusive
 */
export type XOR<T, U> = T | U extends object
  ? (T & Without<U, T>) | (U & Without<T, U>)
  : T | U;

/**
 * Return a type that prohibits the use of keys that are present only in T but not in U
 */
type Without<T, U> = Partial<Record<Exclude<keyof T, keyof U>, never>>;
