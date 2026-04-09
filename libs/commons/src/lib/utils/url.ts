import { Linking } from 'react-native';

/**
 * Checks if the given URL is an HTTP URL.
 * @param url - The URL to check.
 * @returns true if the URL is an HTTP URL, false otherwise.
 */
const isHttp = (url: string): boolean => {
  const urlLower = url.trim().toLocaleLowerCase();
  return urlLower.match(/http(s)?:\/\//gm) !== null;
};

/**
 * Checks if the given URL can be opened.
 * First checks if the URL is an HTTP URL, then checks if the URL can be opened via the React Native Linking API.
 * @param url - The URL to check.
 * @returns A promise that resolves to true if the URL can be opened, false otherwise.
 */
const canOpenUrl = async (url: string) => {
  if (!isHttp(url)) {
    return false;
  }
  return await Linking.canOpenURL(url);
};

/**
 * Opens the given URL in the default browser. If the URL cannot be opened, calls the `onError` callback.
 * @param url - The URL to open.
 * @param onError - The callback to call if the URL cannot be opened.
 */
const openWebUrl = (url: string, onError: () => void) => {
  canOpenUrl(url)
    .then(canOpen => {
      if (canOpen) {
        return Linking.openURL(url);
      } else {
        throw new Error('Cannot open URL');
      }
    })
    .then(() => {
      // Do nothing on success
    })
    .catch(_ => {
      onError();
    });
};

export { openWebUrl };
