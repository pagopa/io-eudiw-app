import { Linking } from 'react-native';
import { isAndroid } from './device';
import * as WebBrowser from 'expo-web-browser';

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

const warmUp = async () => {
  // On Android check if there is a browser to open the authentication session and then warm it up
  if (isAndroid) {
    const { browserPackages } =
      await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    if (browserPackages.length === 0) {
      throw new Error('No browser found to open the authentication session');
    }
  }
  await WebBrowser.warmUpAsync();
};

/**
 * Opens the given URL in the default browser. If the URL cannot be opened, calls the `onError` callback.
 * @param url - The URL to open.
 * @param onError - The callback to call if the URL cannot be opened.
 */
const openWebUrlInApp = (url: string, onError: () => void) => {
  warmUp()
    .then(() => {
      if (isHttp(url)) {
        return WebBrowser.openAuthSessionAsync(url);
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

export { openWebUrl, openWebUrlInApp };
