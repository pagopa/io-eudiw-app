import * as SecureStore from 'expo-secure-store';

/**
 * Dedicated secure-storage vault for IT-Wallet encoded credentials
 * (SD-JWT / MDOC).
 *
 * Keys follow the convention `itw:credential:{credentialType}` for each
 * encoded payload. Since `expo-secure-store` rejects `:` in raw keys, the
 * same `:` -> `_` translation used by the secure storage persist engine
 * is applied here.
 *
 * An internal index (`itw:credential-index`) holds the list of stored
 * credential types so the vault can be enumerated without relying on
 * Redux (`expo-secure-store` has no native key-listing API).
 */

const KEY_PREFIX = 'itw:credential:';
const INDEX_KEY = 'itw:credential-index';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

const encodeKey = (key: string) => key.replace(/:/g, '_');

const credentialKey = (credentialType: string) =>
  encodeKey(`${KEY_PREFIX}${credentialType}`);

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

const writeIndex = async (types: Array<string>): Promise<void> => {
  await SecureStore.setItemAsync(
    encodeKey(INDEX_KEY),
    JSON.stringify(types),
    options
  );
};

export const itwCredentialVault = {
  /**
   * Persists the encoded credential for the given credential type and
   * updates the internal index. Errors propagate so the caller can decide
   * whether to commit the matching metadata to Redux.
   */
  put: async (credentialType: string, encoded: string): Promise<void> => {
    await SecureStore.setItemAsync(
      credentialKey(credentialType),
      encoded,
      options
    );
    const index = await readIndex();
    if (!index.includes(credentialType)) {
      await writeIndex([...index, credentialType]);
    }
  },

  /**
   * Returns the encoded credential for the given type, or `undefined`
   * if the credential is not stored.
   */
  get: async (credentialType: string): Promise<string | undefined> => {
    const value = await SecureStore.getItemAsync(
      credentialKey(credentialType),
      options
    );
    return value ?? undefined;
  },

  /**
   * Deletes the encoded credential for the given type and removes it
   * from the internal index.
   */
  remove: async (credentialType: string): Promise<void> => {
    await SecureStore.deleteItemAsync(credentialKey(credentialType), options);
    const index = await readIndex();
    if (index.includes(credentialType)) {
      await writeIndex(index.filter(t => t !== credentialType));
    }
  },

  /**
   * Returns the list of credential types currently stored in the vault.
   */
  getAllKeys: async (): Promise<Array<string>> => readIndex(),

  /**
   * Removes every credential tracked by the vault and clears the index.
   * Used on wallet lifecycle reset.
   */
  clear: async (): Promise<void> => {
    const index = await readIndex();
    await Promise.all(
      index.map(type =>
        SecureStore.deleteItemAsync(credentialKey(type), options)
      )
    );
    await SecureStore.deleteItemAsync(encodeKey(INDEX_KEY), options);
  }
};

export type ItwCredentialVault = typeof itwCredentialVault;
