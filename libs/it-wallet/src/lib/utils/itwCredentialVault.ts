import * as SecureStore from 'expo-secure-store';
import { StoredCredentialMetadata } from './itwTypesUtils';

/**
 * Dedicated secure-storage vault for IT-Wallet encoded credentials
 * (SD-JWT / MDOC) and the matching metadata index.
 *
 * Keys follow the convention `itw:credential:{credentialType}` for the
 * encoded payload and `itw:credentials-metadata` for the metadata index.
 * Since expo-secure-store rejects `:` in raw keys, the same `:` -> `_`
 * translation used by the secure storage persist engine is applied here.
 *
 * An internal index (`itw:credential-index`) holds the list of stored
 * credential types so the vault can be enumerated without relying on Redux
 * (expo-secure-store has no native key-listing API).
 *
 * The metadata index allows the wallet to skip redux-persist for the
 * credentials slice entirely: at boot the slice is hydrated by reading the
 * metadata directly from secure storage; on every mutation a write-through
 * listener pushes the new state back here.
 */

const KEY_PREFIX = 'itw:credential:';
const INDEX_KEY = 'itw:credential-index';
const METADATA_KEY = 'itw:credentials-metadata';
// Legacy redux-persist key for the credentials slice. Read at first boot so
// users coming from the previous storage layout don't lose their wallet.
const LEGACY_PERSIST_KEY = 'persist:credentials';

export type StoredCredentialsState = {
  credentials: Array<StoredCredentialMetadata>;
  valuesHidden: boolean;
};

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
    await SecureStore.deleteItemAsync(encodeKey(METADATA_KEY), options);
  },

  /**
   * Persists the metadata snapshot of the credentials slice.
   * Stored as a single JSON blob: the payload is small (no encoded
   * credentials) and writing the whole snapshot keeps reads atomic.
   */
  putMetadata: async (state: StoredCredentialsState): Promise<void> => {
    await SecureStore.setItemAsync(
      encodeKey(METADATA_KEY),
      JSON.stringify(state),
      options
    );
  },

  /**
   * Returns the persisted metadata snapshot, or `undefined` if no
   * snapshot has been written yet (e.g. fresh install or post-reset).
   */
  getMetadata: async (): Promise<StoredCredentialsState | undefined> => {
    const raw = await SecureStore.getItemAsync(
      encodeKey(METADATA_KEY),
      options
    );
    if (!raw) {
      return undefined;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        'credentials' in parsed &&
        Array.isArray((parsed as StoredCredentialsState).credentials)
      ) {
        return parsed as StoredCredentialsState;
      }
      return undefined;
    } catch {
      return undefined;
    }
  },

  /**
   * Removes the metadata snapshot.
   */
  clearMetadata: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(encodeKey(METADATA_KEY), options);
  },

  /**
   * Reads the legacy redux-persist payload for the credentials slice
   * (if still present), so the new boot flow can migrate users that
   * upgrade from the previous storage layout. Returns `undefined` when
   * no legacy payload is found.
   */
  readLegacyPersistPayload: async (): Promise<
    | {
        credentials: Array<StoredCredentialMetadata & { credential?: string }>;
        valuesHidden: boolean;
      }
    | undefined
  > => {
    const raw = await SecureStore.getItemAsync(
      encodeKey(LEGACY_PERSIST_KEY),
      options
    );
    if (!raw) {
      return undefined;
    }
    try {
      // redux-persist stores the slice as a wrapper object whose values
      // are JSON-encoded strings, plus a `_persist` housekeeping field.
      const wrapper = JSON.parse(raw) as Record<string, string>;
      const credentials =
        typeof wrapper.credentials === 'string'
          ? (JSON.parse(wrapper.credentials) as Array<
              StoredCredentialMetadata & { credential?: string }
            >)
          : [];
      const valuesHidden =
        typeof wrapper.valuesHidden === 'string'
          ? (JSON.parse(wrapper.valuesHidden) as boolean)
          : false;
      return { credentials, valuesHidden };
    } catch {
      return undefined;
    }
  },

  /**
   * Removes the legacy redux-persist payload after a successful migration.
   */
  clearLegacyPersistPayload: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(encodeKey(LEGACY_PERSIST_KEY), options);
  }
};

export type ItwCredentialVault = typeof itwCredentialVault;
