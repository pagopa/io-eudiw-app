import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PermissionStatus, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';

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
    if (!isFocused || !isNavigationTransitionEnded) {
      return;
    }

    // Optional chain handles the null check implicitly
    if (permission?.status === PermissionStatus.UNDETERMINED) {
      void requestPermission();
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
    // Optional chain here as well
    if (permission?.status !== PermissionStatus.GRANTED) {
      const subscription = AppState.addEventListener(
        'change',
        async nextAppState => {
          if (nextAppState === 'active') {
            await requestPermission();
          }
        }
      );
      return () => subscription.remove();
    }
    return undefined;
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
