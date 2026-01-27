import * as SecureStore from 'expo-secure-store';
import { type Storage } from 'redux-persist';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};

// expo-secure-storage doesn't allow semicolons in keys so we replace them with _
const encodeKey = (key: string) => key.replace(/:/g, '_');

export default function secureStoragePersistor(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStore.getItemAsync(encodeKey(key), options);
      } catch {
        return undefined;
      }
    },

    setItem: async (key, value) =>
      SecureStore.setItemAsync(encodeKey(key), value, options),

    removeItem: async key =>
      SecureStore.deleteItemAsync(encodeKey(key), options)
  };
}
