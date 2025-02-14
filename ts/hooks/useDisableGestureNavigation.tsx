import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';

/**
 * This hook disables gesture navigation and reenables it when the screen is unmounted
 */
export const useDisableGestureNavigation = () => {
  const navigation = useNavigation();
  useEffect(() => {
    // Disable swipe
    navigation.setOptions({gestureEnabled: false});
    navigation.getParent()?.setOptions({gestureEnabled: false});
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({gestureEnabled: true});
    };
  }, [navigation]);
};
