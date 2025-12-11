import * as SecureStorage from 'io-react-native-secure-storage';
import { type Storage } from 'redux-persist';

/**
 * Creates a custom redux-persist persistor based on `io-react-native-secure-storage`.
 * It can be used to store sensitive data in a secure way.
 */
export default function secureStoragePersistor(): Storage {
  return {
    getItem: async key => {
      try {
        return await SecureStorage.get(key);
      } catch (err) {
        return undefined;
      }
    },

    setItem: (key, value) => SecureStorage.put(key, value),

    removeItem: key => SecureStorage.remove(key)
  };
}
