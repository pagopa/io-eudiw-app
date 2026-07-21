import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import MAIN_ROUTES from '../navigation/main/routes';
import { useAppDispatch } from '../store';
import {
  ProximityEngagementMode,
  setProximityEngagementMode,
  setProximityStatusStarted
} from '../store/proximity';
import { checkBluetoothActivation } from '../utils/bluetooth';
import { requestBlePermissions } from '../utils/permissions';

/**
 * Presentment screen shown for each proximity engagement mode.
 */
const ENGAGEMENT_SCREEN = {
  qrcode: MAIN_ROUTES.BLE_PRESENTMENT,
  nfc: MAIN_ROUTES.NFC_PRESENTMENT
} as const;

/**
 * Hook exposing a helper to start (or restart) a proximity engagement once the
 * related hardware gates (Bluetooth permissions/activation for QR, NFC
 * activation for NFC) have been cleared. It configures the proximity listener
 * with the requested engagement mode and opens the related presentment screen.
 */
export const useProximityEngagement = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  /**
   * Sets the engagement mode and (re)starts the proximity listener (handled by
   * `takeLatestEffect`), then navigates to the engagement presentment screen.
   * Gate screens pass `replaceScreen: true` to remove themselves from the
   * stack, so that closing the presentment screen doesn't land back on them.
   */
  const startEngagement = useCallback(
    (mode: ProximityEngagementMode, options?: { replaceScreen?: boolean }) => {
      dispatch(setProximityEngagementMode(mode));
      dispatch(setProximityStatusStarted());
      if (options?.replaceScreen) {
        navigation.dispatch(StackActions.replace(ENGAGEMENT_SCREEN[mode]));
      } else {
        navigation.navigate(ENGAGEMENT_SCREEN[mode]);
      }
    },
    [dispatch, navigation]
  );

  /**
   * Entry point of a proximity verification: runs the Bluetooth hardware
   * gates and starts the QR engagement when they pass, otherwise navigates
   * to the first failing gate's instructions screen.
   */
  const startQrVerification = useCallback(async () => {
    if (!(await requestBlePermissions())) {
      navigation.navigate(MAIN_ROUTES.PROXIMITY_BLUETOOTH_PERMISSIONS);
      return;
    }
    if (!(await checkBluetoothActivation())) {
      navigation.navigate(MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION);
      return;
    }
    startEngagement('qrcode');
  }, [navigation, startEngagement]);

  return { startEngagement, startQrVerification };
};
