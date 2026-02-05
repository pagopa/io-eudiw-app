import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PermissionStatus, useCameraPermissions, Camera } from 'expo-camera';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';
import { isAndroid } from '../../../../utils/device';

/**
 * Hook to handle camera permission status with platform specific behavior
 */
export const useCameraPermissionStatus = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<
        MainNavigatorParamsList,
        keyof MainNavigatorParamsList
      >
    >();

  const [permission, requestPermission] = useCameraPermissions();

  const isFocused = useIsFocused();
  const [isNavigationTransitionEnded, setIsNavigationTransitionEnded] =
    useState(false);

  /**
   * Opens the system settings to allow user to change the camera permission
   */
  const openCameraSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  /**
   * Checks permission requirements on mount/focus.
   */
  useEffect(() => {
    // Only auto-request if the status is UNDETERMINED (fresh install) or isAskEveryTime
    const isUndetermined = permission?.status === PermissionStatus.UNDETERMINED;
    const isAskEveryTime =
      permission?.status === PermissionStatus.DENIED &&
      !permission?.canAskAgain;
    if (
      isAndroid &&
      (isUndetermined || isAskEveryTime) &&
      isFocused &&
      isNavigationTransitionEnded
    ) {
      void requestPermission();
    }
  }, [
    permission?.status,
    requestPermission,
    isFocused,
    isNavigationTransitionEnded,
    permission?.canAskAgain
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active' && isFocused) {
          // Get the latest permission status when coming back from settings
          const status = await Camera.getCameraPermissionsAsync();
          const isGranted = status.status === PermissionStatus.GRANTED;
          // If on Android "Ask every time" is selected, then the permission is set to DENIED and canAskAgain is false
          const isAskEveryTime =
            status.status === PermissionStatus.DENIED && !status.canAskAgain;

          if (isGranted || isAskEveryTime) {
            // Refresh permission status
            await requestPermission();
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isFocused, requestPermission]);

  /**
   * Listener for navigation transition end to detect if the user has navigated
   * to the barcode screen and we can request the camera permission.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      setIsNavigationTransitionEnded(true);
    });
    return unsubscribe;
  }, [navigation]);

  return {
    // Returns PermissionStatus | undefined (if loading)
    cameraPermissionStatus: permission?.status,
    requestPermission,
    openCameraSettings
  };
};
