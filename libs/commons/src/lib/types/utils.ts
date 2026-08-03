export type NonEmptyArray<T> = [T, ...T[]];

/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> = object & {
  [K in keyof T]: T[K];
};

export type TestID = { testID?: string };

export type WithTestID<T> = T & TestID;
