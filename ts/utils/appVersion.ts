import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const getAppVersion = () =>
  Platform.select({
    ios: DeviceInfo.getReadableVersion(),
    default: DeviceInfo.getVersion()
  });
