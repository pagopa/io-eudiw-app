import * as SecureStore from 'expo-secure-store';

const PREFIX = 'itw:credential:';
const INDEX_KEY = 'itw:credential-index';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

/**
 * Encodes a key by replacing colons with underscores, as expo-secure-store
 * does not support colons in keys.
 *
 * @param key The key to encode
 * @returns The encoded key
 */
const encodeKey = (key: string) => key.replace(/:/g, '_');

/**
 * Generates the storage key for a given credential type.
 *
 * Example: for credentialType "dc_sd_jwt_PersonalIdentificationData",
 * the generated storage key will be "itw:credential:dc_sd_jwt_PersonalIdentificationData"
 *
 * @param credentialType The credential type
 * @returns The storage key
 */
const storageKey = (credentialType: string) =>
  encodeKey(`${PREFIX}${credentialType}`);

/**
 * Type guard to check if an error is a VALUE_NOT_FOUND error emitted from
 * expo-secure-store.
 *
 * @param e The error to check
 * @returns True if the error is a VALUE_NOT_FOUND error, false otherwise
 */
const isValueNotFoundError = (e: unknown): e is Error =>
  e instanceof Error && e.message === 'VALUE_NOT_FOUND';

/**
 * Reads the credential index from secure storage.
 * The index is a JSON array of credential types stored in the secure storage.
 *
 * @returns A promise that resolves to an array of credential types
 */
const readIndex = async (): Promise<Array<string>> => {
  const raw = await SecureStore.getItemAsync(encodeKey(INDEX_KEY), options);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
};

/**
 * Writes the credential index to secure storage.
 *
 * @param types The array of credential types to persist
 */
const writeIndex = async (types: Array<string>): Promise<void> => {
  await SecureStore.setItemAsync(
    encodeKey(INDEX_KEY),
    JSON.stringify(types),
    options
  );
};

/**
 * Serializes access to the credential index.
 *
 * `updateIndex` performs a read-modify-write on the index, so concurrent
 * callers (e.g. `storeAll`/`removeAll`/`clear`, which fan out over
 * `Promise.all`, or the vault coherence listener) could read the same snapshot
 * and clobber each other's changes: the last write wins and every interleaved
 * update is lost. Chaining every mutation onto a single promise forces them to
 * run one after another.
 *
 * @param task The index mutation to run once the lock is free
 * @returns A promise that resolves with the task's result
 */
let indexLock: Promise<unknown> = Promise.resolve();

const withIndexLock = <T>(task: () => Promise<T>): Promise<T> => {
  const result = indexLock.then(() => task());
  // Keep the chain alive even if `task` rejects, so a single failure does not
  // wedge every subsequent index mutation.
  indexLock = result.then(
    () => undefined,
    () => undefined
  );
  return result;
};

/**
 * Updates the credential index by adding or removing a credential type.
 * The read-modify-write is serialized through {@link withIndexLock} so
 * concurrent callers cannot overwrite each other's changes.
 *
 * @param credentialType The credential type to add or remove
 * @param operation The operation to perform ('add' or 'remove')
 * @returns A promise that resolves to `true` if the index was actually changed,
 * `false` if it was already in the requested state (no-op)
 */
const updateIndex = async (
  credentialType: string,
  operation: 'add' | 'remove'
): Promise<boolean> =>
  withIndexLock(async () => {
    const index = await readIndex();
    const hasEntry = index.includes(credentialType);

    if (operation === 'add' && !hasEntry) {
      await writeIndex([...index, credentialType]);
      return true;
    } else if (operation === 'remove' && hasEntry) {
      await writeIndex(index.filter(t => t !== credentialType));
      return true;
    }
    return false;
  });

/**
 * Stores a credential's SD-JWT/MDOC in the Secure Storage.
 *
 * @param credentialType The credential type (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @param credential The credential's SD-JWT/MDOC as a string
 */
const store = async (
  credentialType: string,
  credential: string
): Promise<void> => {
  // Add the index entry *before* writing the credential. If we wrote the
  // credential first and the index update then failed, the credential would be
  // invisible to the coherence listener (which reconciles from the index) and
  // would leak in secure storage until the app is uninstalled. Writing the
  // index first means a failed credential write is recoverable via rollback.
  const indexAdded = await updateIndex(credentialType, 'add');
  try {
    await SecureStore.setItemAsync(
      storageKey(credentialType),
      credential,
      options
    );
  } catch (e) {
    // Roll back on a (non-crash) write failure so we never advertise a
    // credential that was never stored. Only undo the entry if *we* added it:
    // when overwriting an already-indexed credential, the previous one is still
    // stored and must stay in the index.
    if (indexAdded) {
      await updateIndex(credentialType, 'remove');
    }
    throw e;
  }
};

/**
 * Store multiple credentials' SD-JWT/MDOC in the Secure Storage.
 *
 * @param credentials An array of objects containing credentialType and credential string
 */
const storeAll = async (
  credentials: ReadonlyArray<{ credentialType: string; credential: string }>
): Promise<void> => {
  await Promise.all(
    credentials.map(data => store(data.credentialType, data.credential))
  );
};

/**
 * Retrieves a credential's SD-JWT/MDOC from the Secure Storage using its type.
 *
 * @param credentialType The credential type (e.g., "dc_sd_jwt_PersonalIdentificationData")
 * @returns A promise that resolves to the credential's SD-JWT/MDOC as a string, or undefined if not found
 */
const get = async (credentialType: string): Promise<string | undefined> => {
  try {
    return (
      (await SecureStore.getItemAsync(storageKey(credentialType), options)) ??
      undefined
    );
  } catch (e) {
    if (isValueNotFoundError(e)) {
      return undefined;
    }
    throw e;
  }
};

/**
 * Removes a credential's SD-JWT/MDOC from the Secure Storage using its type.
 *
 * @param credentialType The credential type (e.g., "dc_sd_jwt_PersonalIdentificationData")
 */
const remove = async (credentialType: string): Promise<void> => {
  await SecureStore.deleteItemAsync(storageKey(credentialType), options);
  await updateIndex(credentialType, 'remove');
};

/**
 * Removes all credentials' SD-JWT/MDOCs from the Secure Storage with the given types.
 *
 * @param credentialIds An array of credential types
 */
const removeAll = async (
  credentialIds: ReadonlyArray<string>
): Promise<void> => {
  await Promise.all(credentialIds.map(remove));
};

/**
 * Lists all the credential types stored in the Secure Storage.
 *
 * @returns A promise that resolves to an array of credential types
 */
const list = async (): Promise<ReadonlyArray<string>> => {
  return readIndex();
};

/**
 * Clears all credentials' SD-JWT/MDOCs from the Secure Storage.
 */
const clear = async (): Promise<void> => {
  const credentialTypes = await list();
  await removeAll(credentialTypes);
};

export const CredentialsVault = {
  store,
  storeAll,
  get,
  remove,
  removeAll,
  clear,
  list
};

export type CredentialsVaultType = typeof CredentialsVault;
