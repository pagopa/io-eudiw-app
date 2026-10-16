import { Linking, Platform } from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

/**
 * Checks if Bluetooth is currently activated on the device.
 * @returns A promise that resolves to true if Bluetooth is powered on, or false otherwise.
 */
export const checkBluetoothActivation = async () => {
  const bluetoothState = await BluetoothStateManager.getState();
  return bluetoothState === 'PoweredOn';
};

/**
 * Opens the Bluetooth settings page on the device. On iOS, it attempts to open
 * the Bluetooth settings directly, while on Android it opens the Bluetooth
 * settings screen.
 */
export const openBluetoothPreferences = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('App-Prefs:Bluetooth').catch(() => null);
  } else {
    Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS').catch(() => null);
  }
};
