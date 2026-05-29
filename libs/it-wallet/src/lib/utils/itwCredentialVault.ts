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
 * Updates the credential index by adding or removing a credential type.
 *
 * @param credentialType The credential type to add or remove
 * @param operation The operation to perform ('add' or 'remove')
 */
const updateIndex = async (
  credentialType: string,
  operation: 'add' | 'remove'
): Promise<void> => {
  const index = await readIndex();
  const hasEntry = index.includes(credentialType);

  if (operation === 'add' && !hasEntry) {
    await writeIndex([...index, credentialType]);
  } else if (operation === 'remove' && hasEntry) {
    await writeIndex(index.filter(t => t !== credentialType));
  }
};

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
  await SecureStore.setItemAsync(
    storageKey(credentialType),
    credential,
    options
  );
  await updateIndex(credentialType, 'add');
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
