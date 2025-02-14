import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Returns the application version.
 * @returns a string representing the application version
 */
export const getAppVersion = () =>
  Platform.select({
    ios: DeviceInfo.getReadableVersion(),
    default: DeviceInfo.getVersion()
  });

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
