import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * Returns the application version.
 * @returns a string representing the application version
 */
export const getAppVersion = () =>
  `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`;

export const isAndroid = Platform.OS === 'android';
export const isIos = Platform.OS === 'ios';
