export type NonEmptyArray<T> = [T, ...Array<T>];

export type TestID = {testID?: string};

export type WithTestID<T> = T & TestID;
