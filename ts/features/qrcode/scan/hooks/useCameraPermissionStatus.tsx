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
    if (isAndroid && permission?.status === PermissionStatus.DENIED) {
      if (isFocused && isNavigationTransitionEnded) {
        void requestPermission();
      }
    }
  }, [
    permission?.status,
    requestPermission,
    isFocused,
    isNavigationTransitionEnded
  ]);

  /**
   * Setup listener for app state changes.
   */
  useEffect(() => {
    if (permission?.status === PermissionStatus.DENIED) {
      const unsubscribe = AppState.addEventListener(
        'change',
        async nextAppState => {
          if (nextAppState === 'active') {
            // Fetch the latest permission status and if the permission is granted and it was previsouly denied, request it again to update the permission state
            const status = await Camera.getCameraPermissionsAsync();
            if (
              status.granted &&
              permission?.status !== PermissionStatus.GRANTED
            ) {
              await requestPermission();
            }
          }
        }
      );

      return () => unsubscribe.remove();
    }
    return () => null;
  }, [permission?.status, requestPermission]);

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
