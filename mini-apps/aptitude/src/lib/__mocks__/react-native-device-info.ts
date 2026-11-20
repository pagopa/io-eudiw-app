import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Returns the application version.
 * @returns a string representing the application version
 */
export const getAppVersion = () =>
  Platform.select({
    default: DeviceInfo.getVersion(),
    ios: DeviceInfo.getReadableVersion()
  });

export const isAndroid = Platform.OS === 'android';
export const isIos = Platform.OS === 'ios';
