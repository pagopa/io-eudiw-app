import { Platform } from 'react-native';
import {
  checkMultiple,
  type Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from 'react-native-permissions';

/**
 * Utility functions to request BLE permissions for the proximity process.
 * @returns True if all permissions were granted, false otherwise.
 */
export const requestBlePermissions = async (): Promise<boolean> => {
  const permissionsToCheck = getPermissionsToBeChecked();

  try {
    // Check current permission status
    const statuses = await checkMultiple(permissionsToCheck);

    // Filter out already granted permissions
    const permissionsToRequest = permissionsToCheck.filter(
      permission => statuses[permission] !== RESULTS.GRANTED
    );

    if (permissionsToRequest.length > 0) {
      // Request only the missing permissions
      const requestResults = await requestMultiple(permissionsToRequest);

      // Verify if all requested permissions are granted
      return permissionsToRequest.every(
        permission => requestResults[permission] === RESULTS.GRANTED
      );
    }

    return true; // All permissions were already granted
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get the permissions required for BLE on the current platform.
 * @returns An array of permissions to be checked.
 */
const getPermissionsToBeChecked = (): Array<Permission> => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 31) {
      // Android 12 and above: Request new Bluetooth permissions along with location.
      return [
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
      ];
    } else {
      // Android 9 to Android 11: Only location permission is required for BLE.
      return [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
    }
  } else {
    // iOS permissions required are Bluetooth and location.
    return [PERMISSIONS.IOS.BLUETOOTH];
  }
};
